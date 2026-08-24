import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectId = 'daily-test-lab-rules-test';
const adminAuth = {
  email: 'kpa100plus@gmail.com',
  email_verified: true
};
const memberAuth = {
  email: 'member@example.com',
  email_verified: true
};
let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: await readFile(path.join(root, 'firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
});

after(async () => {
  await environment.cleanup();
});

async function seed(entries) {
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();
    await Promise.all(entries.map(([documentPath, data]) => setDoc(doc(database, documentPath), data)));
  });
}

function memberDatabase(uid = 'member-1', token = memberAuth) {
  return environment.authenticatedContext(uid, token).firestore();
}

function adminDatabase() {
  return environment.authenticatedContext('admin-1', adminAuth).firestore();
}

test('public reads only published content and public aggregate documents', async () => {
  await seed([
    ['balance_games/lunch', { gameId: 'lunch', a: 2, b: 3, total: 5 }],
    ['tests/published-test', { status: 'published' }],
    ['tests/draft-test', { status: 'draft' }],
    ['daily_contents/current', { title: '오늘 콘텐츠' }],
    ['private/example', { value: true }]
  ]);
  const database = environment.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(database, 'balance_games/lunch')));
  await assertSucceeds(getDoc(doc(database, 'daily_contents/current')));
  await assertSucceeds(getDoc(doc(database, 'tests/published-test')));
  await assertFails(getDoc(doc(database, 'tests/draft-test')));
  await assertFails(getDoc(doc(database, 'private/example')));
  await assertFails(getDocs(collection(database, 'votes')));
});

test('member profile is private and the stored email must match the verified token', async () => {
  const database = memberDatabase();
  const profile = doc(database, 'users/member-1');
  const validData = {
    displayName: 'member',
    email: memberAuth.email,
    provider: 'google.com',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  };

  await assertSucceeds(setDoc(profile, validData));
  await assertSucceeds(getDoc(profile));
  await assertFails(getDoc(doc(memberDatabase('member-2', { ...memberAuth, email: 'other@example.com' }), 'users/member-1')));
  await assertFails(getDocs(collection(database, 'users')));
  await assertFails(setDoc(doc(memberDatabase('member-3'), 'users/member-3'), {
    ...validData,
    email: 'spoofed@example.com'
  }));
  await assertFails(setDoc(doc(memberDatabase('member-4', { email: 'unverified@example.com', email_verified: false }), 'users/member-4'), {
    ...validData,
    email: 'unverified@example.com'
  }));
});

test('game scores are owner-only, bounded and never deletable', async () => {
  const database = memberDatabase();
  const score = doc(database, 'game_scores/member-1/scores/memory');
  const validScore = {
    userId: 'member-1',
    gameId: 'memory',
    best: 4,
    last: 4,
    attempts: 1,
    scoreDirection: 'higher',
    updatedAt: serverTimestamp()
  };

  await assertSucceeds(setDoc(score, validScore));
  await assertSucceeds(getDoc(score));
  await assertSucceeds(updateDoc(score, {
    best: 5,
    last: 5,
    attempts: 2,
    updatedAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(database, 'game_scores/member-1/scores/overflow'), {
    ...validScore,
    gameId: 'overflow',
    best: 1000000001
  }));
  await assertFails(getDoc(doc(memberDatabase('member-2'), 'game_scores/member-1/scores/memory')));
  await assertFails(deleteDoc(score));
});

test('a balance vote and aggregate increment must commit atomically and only once', async () => {
  await seed([['balance_games/lunch', {
    gameId: 'lunch',
    a: 2,
    b: 3,
    total: 5,
    updatedAt: new Date()
  }]]);
  const database = memberDatabase();
  const vote = doc(database, 'votes/lunch_member-1');
  const stats = doc(database, 'balance_games/lunch');
  const batch = writeBatch(database);
  batch.set(vote, {
    gameId: 'lunch',
    userId: 'member-1',
    choice: 'a',
    createdAt: serverTimestamp()
  });
  batch.update(stats, {
    a: increment(1),
    total: increment(1),
    updatedAt: serverTimestamp()
  });

  await assertSucceeds(batch.commit());
  assert.equal((await getDoc(stats)).data().total, 6);
  await assertFails(setDoc(vote, {
    gameId: 'lunch',
    userId: 'member-1',
    choice: 'b',
    createdAt: serverTimestamp()
  }));
  await assertFails(updateDoc(stats, { total: increment(1), updatedAt: serverTimestamp() }));
});

test('only the legacy verified administrator can query drafts and write managed content', async () => {
  await seed([
    ['tests/draft-test', { status: 'draft' }],
    ['tests/published-test', { status: 'published' }]
  ]);
  const draftQuery = (database) => query(collection(database, 'tests'), where('status', '==', 'draft'));

  await assertSucceeds(getDocs(draftQuery(adminDatabase())));
  await assertSucceeds(setDoc(doc(adminDatabase(), 'daily_contents/current'), {
    category: '오늘 테스트',
    title: '보안 규칙 확인 콘텐츠',
    description: '관리자 권한으로만 저장되는 테스트용 오늘의 콘텐츠입니다.',
    duration: '3분',
    actionLabel: '시작하기',
    note: 'Emulator 테스트',
    icon: '🔐',
    accent: 'violet',
    route: '/test/focus-style/',
    status: 'published',
    updatedBy: 'admin-1',
    updatedAt: serverTimestamp()
  }));
  await assertFails(getDocs(draftQuery(memberDatabase())));
  await assertFails(setDoc(doc(memberDatabase(), 'daily_contents/current'), { status: 'published' }));
});
