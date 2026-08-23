import { getFirebaseServices } from './firebase-client.js';
import { mergeScoreCollections, mergeScoreRecords } from './score-engine.js';

export const GAME_RECORD_KEY = 'daily-test-lab.game-records.v1';
export const MEMBER_CACHE_KEY = 'daily-test-lab.member.v1';

let sessionPromise;

const safeStorage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 브라우저 저장이 제한돼도 Firebase 저장은 계속 시도합니다.
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // 저장소 접근이 제한된 환경에서는 캐시 삭제를 건너뜁니다.
    }
  }
};

function cacheMember(user) {
  if (!user || user.isAnonymous) {
    safeStorage.set(MEMBER_CACHE_KEY, { type: 'guest' });
    return;
  }
  safeStorage.set(MEMBER_CACHE_KEY, {
    type: 'member',
    displayName: user.displayName || '회원',
    email: user.email || ''
  });
}

export function readLocalGameRecords() {
  return safeStorage.get(GAME_RECORD_KEY, {});
}

export function writeLocalGameRecords(records) {
  safeStorage.set(GAME_RECORD_KEY, records);
}

export function hasRecordSession() {
  const records = readLocalGameRecords();
  const member = safeStorage.get(MEMBER_CACHE_KEY, {});
  return Object.keys(records).length > 0 || member.type === 'member';
}

export async function ensureMemberSession() {
  const services = await getFirebaseServices();
  if (typeof services.auth.authStateReady === 'function') {
    await services.auth.authStateReady();
  }
  if (services.auth.currentUser) {
    cacheMember(services.auth.currentUser);
    return { services, user: services.auth.currentUser };
  }

  sessionPromise ??= services.authSdk.signInAnonymously(services.auth)
    .finally(() => { sessionPromise = null; });
  const credential = await sessionPromise;
  cacheMember(credential.user);
  return { services, user: credential.user };
}

async function saveMemberProfile(services, user) {
  if (!user || user.isAnonymous) return;
  const { doc, runTransaction, serverTimestamp } = services.firestoreSdk;
  const profileReference = doc(services.db, 'users', user.uid);
  await runTransaction(services.db, async (transaction) => {
    const snapshot = await transaction.get(profileReference);
    const profile = {
      displayName: user.displayName || '회원',
      email: user.email || '',
      provider: 'google.com',
      lastLoginAt: serverTimestamp()
    };
    if (snapshot.exists()) {
      transaction.set(profileReference, {
        ...profile,
        createdAt: snapshot.data().createdAt
      });
    } else {
      transaction.set(profileReference, {
        ...profile,
        createdAt: serverTimestamp()
      });
    }
  });
}

function scoreReference(services, userId, gameId) {
  return services.firestoreSdk.doc(
    services.db,
    'game_scores',
    userId,
    'scores',
    gameId
  );
}

export async function saveGameAttempt(game, localRecord) {
  const { services, user } = await ensureMemberSession();
  const { runTransaction, serverTimestamp } = services.firestoreSdk;
  const reference = scoreReference(services, user.uid, game.slug);
  let savedRecord;

  await runTransaction(services.db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    const remote = snapshot.exists() ? snapshot.data() : {};
    const merged = mergeScoreRecords(game.scoreDirection, localRecord, remote);
    const attempts = snapshot.exists()
      ? Math.max(
        (Number(remote.attempts) || 0) + 1,
        Number(localRecord.attempts) || 1
      )
      : Math.max(1, Number(localRecord.attempts) || 1);
    savedRecord = {
      ...merged,
      last: Number(localRecord.last),
      attempts,
      updatedAt: new Date().toISOString()
    };
    transaction.set(reference, {
      userId: user.uid,
      gameId: game.slug,
      best: savedRecord.best,
      last: savedRecord.last,
      attempts: savedRecord.attempts,
      scoreDirection: game.scoreDirection,
      updatedAt: serverTimestamp()
    });
  });

  const localRecords = readLocalGameRecords();
  localRecords[game.slug] = savedRecord;
  writeLocalGameRecords(localRecords);
  return { user, record: savedRecord, isMember: !user.isAnonymous };
}

async function readRemoteRecords(services, user) {
  const { collection, getDocs } = services.firestoreSdk;
  const snapshot = await getDocs(collection(services.db, 'game_scores', user.uid, 'scores'));
  const records = {};
  snapshot.forEach((documentSnapshot) => {
    records[documentSnapshot.id] = documentSnapshot.data();
  });
  return records;
}

export async function synchronizeLocalGameRecords(games) {
  const { services, user } = await ensureMemberSession();
  const localRecords = readLocalGameRecords();
  const remoteRecords = await readRemoteRecords(services, user);
  const mergedRecords = mergeScoreCollections(games, localRecords, remoteRecords);
  const { runTransaction, serverTimestamp } = services.firestoreSdk;

  for (const game of games) {
    const record = mergedRecords[game.slug];
    if (!record || !Number.isFinite(Number(record.best))) continue;
    const local = localRecords[game.slug];
    const remote = remoteRecords[game.slug];
    const needsWrite = Boolean(local) && (
      !remote ||
      Number(record.best) !== Number(remote.best) ||
      Number(record.last) !== Number(remote.last) ||
      Number(record.attempts) !== Number(remote.attempts)
    );
    if (!needsWrite) continue;
    const reference = scoreReference(services, user.uid, game.slug);
    await runTransaction(services.db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      const remote = snapshot.exists() ? snapshot.data() : {};
      const finalRecord = mergeScoreRecords(game.scoreDirection, record, remote);
      transaction.set(reference, {
        userId: user.uid,
        gameId: game.slug,
        best: finalRecord.best,
        last: finalRecord.last,
        attempts: Math.max(1, finalRecord.attempts),
        scoreDirection: game.scoreDirection,
        updatedAt: serverTimestamp()
      });
      mergedRecords[game.slug] = {
        ...finalRecord,
        updatedAt: new Date().toISOString()
      };
    });
  }

  writeLocalGameRecords(mergedRecords);
  cacheMember(user);
  return { services, user, records: mergedRecords, isMember: !user.isAnonymous };
}

export async function signInWithGoogle(games = []) {
  const { services, user: currentUser } = await ensureMemberSession();
  const provider = new services.authSdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  let credential;

  if (currentUser.isAnonymous) {
    try {
      credential = await services.authSdk.linkWithPopup(currentUser, provider);
    } catch (error) {
      if (!['auth/credential-already-in-use', 'auth/email-already-in-use'].includes(error.code)) {
        throw error;
      }
      const googleCredential = services.authSdk.GoogleAuthProvider.credentialFromError(error);
      if (!googleCredential) throw error;
      credential = await services.authSdk.signInWithCredential(services.auth, googleCredential);
    }
  } else {
    credential = await services.authSdk.signInWithPopup(services.auth, provider);
  }

  await saveMemberProfile(services, credential.user);
  cacheMember(credential.user);
  if (games.length) await synchronizeLocalGameRecords(games);
  return credential.user;
}

export async function signOutMember() {
  const services = await getFirebaseServices();
  await services.authSdk.signOut(services.auth);
  safeStorage.remove(MEMBER_CACHE_KEY);
}

export async function getMemberDashboard(games) {
  return synchronizeLocalGameRecords(games);
}
