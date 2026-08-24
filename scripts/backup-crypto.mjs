import { readFile, writeFile } from 'node:fs/promises';
import { decryptBackup, encryptBackup } from './backup-crypto-lib.mjs';

const [operation, inputPath, outputPath] = process.argv.slice(2);
const passphrase = process.env.BACKUP_ENCRYPTION_KEY;

if (!['encrypt', 'decrypt'].includes(operation) || !inputPath || !outputPath) {
  throw new Error('Usage: node scripts/backup-crypto.mjs <encrypt|decrypt> <input> <output>');
}

const input = await readFile(inputPath);
const output = operation === 'encrypt'
  ? await encryptBackup(input, passphrase)
  : await decryptBackup(input, passphrase);
await writeFile(outputPath, output, { mode: 0o600 });
console.log(`${operation} complete: ${outputPath}`);
