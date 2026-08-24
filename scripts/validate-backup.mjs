import { readFile } from 'node:fs/promises';

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: node scripts/validate-backup.mjs <backup.json>');

const backup = JSON.parse(await readFile(inputPath, 'utf8'));
if (backup.schemaVersion !== 1 || typeof backup.projectId !== 'string' || !backup.projectId) {
  throw new Error('Backup metadata is invalid.');
}
if (!Array.isArray(backup.documents) || backup.documentCount !== backup.documents.length) {
  throw new Error('Backup document count is invalid.');
}
const paths = backup.documents.map((document) => document.path);
if (
  paths.some((documentPath) => !/^[^/]+\/[^/]+(?:\/[^/]+\/[^/]+)*$/.test(documentPath))
  || new Set(paths).size !== paths.length
) {
  throw new Error('Backup contains an invalid or duplicate document path.');
}
for (const document of backup.documents) {
  if (!document.data || typeof document.data !== 'object' || Array.isArray(document.data)) {
    throw new Error(`Backup document data is invalid: ${document.path}`);
  }
}
console.log(`Backup validation complete: ${backup.documentCount} documents`);
