import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'daily-test-lab-rules-test',
    firestore: {
      rules: await readFile(path.join(root, 'firestore.lockdown.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    await Promise.all([
      setDoc(doc(context.firestore(), 'balance_games/lunch'), { gameId: 'lunch', a: 2, b: 3, total: 5 }),
      setDoc(doc(context.firestore(), 'tests/public-test'), { status: 'published' }),
      setDoc(doc(context.firestore(), 'users/member-1'), { email: 'member@example.com' }),
      setDoc(doc(context.firestore(), 'daily_contents/current'), { status: 'published' })
    ]);
  });
});

after(async () => {
  await environment.cleanup();
});

test('lockdown preserves required reads but blocks every tested write', async () => {
  const publicDatabase = environment.unauthenticatedContext().firestore();
  const memberDatabase = environment.authenticatedContext('member-1', {
    email: 'member@example.com',
    email_verified: true
  }).firestore();
  const adminDatabase = environment.authenticatedContext('admin-1', {
    email: 'kpa100plus@gmail.com',
    email_verified: true
  }).firestore();

  await assertSucceeds(getDoc(doc(publicDatabase, 'balance_games/lunch')));
  await assertSucceeds(getDoc(doc(publicDatabase, 'tests/public-test')));
  await assertSucceeds(getDoc(doc(memberDatabase, 'users/member-1')));
  await assertFails(setDoc(doc(memberDatabase, 'users/member-2'), { email: 'member@example.com' }));
  await assertFails(updateDoc(doc(memberDatabase, 'balance_games/lunch'), {
    total: 6,
    updatedAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(memberDatabase, 'game_scores/member-1/scores/memory'), {
    userId: 'member-1', gameId: 'memory', best: 1, last: 1, attempts: 1
  }));
  await assertFails(setDoc(doc(memberDatabase, 'votes/lunch_member-1'), {
    gameId: 'lunch', userId: 'member-1', choice: 'a', createdAt: serverTimestamp()
  }));
  await assertFails(updateDoc(doc(adminDatabase, 'daily_contents/current'), {
    status: 'published', updatedAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(adminDatabase, 'tests/new-test'), {
    status: 'published', updatedAt: serverTimestamp()
  }));
  await assertFails(setDoc(doc(adminDatabase, 'balance_content/new-game'), {
    status: 'published', updatedAt: serverTimestamp()
  }));
  await assertFails(deleteDoc(doc(adminDatabase, 'tests/public-test')));
});
