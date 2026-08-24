import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt as scryptCallback
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const format = 'daily-test-lab-firestore-backup-v1';

function requirePassphrase(passphrase) {
  if (typeof passphrase !== 'string' || passphrase.length < 32) {
    throw new Error('BACKUP_ENCRYPTION_KEY must contain at least 32 characters.');
  }
}

export async function encryptBackup(plaintext, passphrase) {
  requirePassphrase(passphrase);
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await scrypt(passphrase, salt, 32);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.from(`${JSON.stringify({
    format,
    kdf: 'scrypt',
    cipher: 'aes-256-gcm',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64')
  })}\n`, 'utf8');
}

export async function decryptBackup(envelopeBuffer, passphrase) {
  requirePassphrase(passphrase);
  const envelope = JSON.parse(envelopeBuffer.toString('utf8'));
  if (
    envelope.format !== format
    || envelope.kdf !== 'scrypt'
    || envelope.cipher !== 'aes-256-gcm'
  ) {
    throw new Error('Unsupported encrypted backup format.');
  }

  const salt = Buffer.from(envelope.salt, 'base64');
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const ciphertext = Buffer.from(envelope.ciphertext, 'base64');
  if (salt.length !== 16 || iv.length !== 12 || tag.length !== 16 || !ciphertext.length) {
    throw new Error('Encrypted backup envelope is malformed.');
  }

  const key = await scrypt(passphrase, salt, 32);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
