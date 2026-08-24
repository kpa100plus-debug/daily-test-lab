import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decryptBackup, encryptBackup } from '../scripts/backup-crypto-lib.mjs';

const passphrase = 'daily-test-lab-test-key-32-characters-minimum';
const sample = Buffer.from(JSON.stringify({
  schemaVersion: 1,
  projectId: 'daily-test-lab',
  createdAt: '2026-08-24T00:00:00.000Z',
  documentCount: 1,
  documents: [{ path: 'users/example', data: { email: 'private@example.com' } }]
}));

test('backup encryption round trip does not expose plaintext', async () => {
  const encrypted = await encryptBackup(sample, passphrase);
  assert.equal(encrypted.includes(Buffer.from('private@example.com')), false);
  assert.deepEqual(await decryptBackup(encrypted, passphrase), sample);
});

test('backup encryption rejects a wrong key and tampering', async () => {
  const encrypted = await encryptBackup(sample, passphrase);
  await assert.rejects(() => decryptBackup(encrypted, `${passphrase}-wrong`));
  const envelope = JSON.parse(encrypted.toString('utf8'));
  envelope.ciphertext = `${envelope.ciphertext.slice(0, -2)}AA`;
  await assert.rejects(() => decryptBackup(Buffer.from(JSON.stringify(envelope)), passphrase));
});
