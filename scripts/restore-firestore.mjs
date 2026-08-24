import { readFile } from 'node:fs/promises';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { GeoPoint, Timestamp, getFirestore } from 'firebase-admin/firestore';

function decodeValue(value, database) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((nested) => decodeValue(nested, database));
  if (value && typeof value === 'object' && value.__type) {
    if (value.__type === 'date') return new Date(value.value);
    if (value.__type === 'timestamp') return Timestamp.fromDate(new Date(value.value));
    if (value.__type === 'bytes') return Buffer.from(value.value, 'base64');
    if (value.__type === 'geopoint') return new GeoPoint(value.latitude, value.longitude);
    if (value.__type === 'reference') return database.doc(value.path);
    throw new Error(`Unsupported encoded backup value: ${value.__type}`);
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, decodeValue(nested, database)])
  );
}

const [inputPath] = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const apply = process.argv.includes('--apply');
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
if (!inputPath) throw new Error('Usage: node scripts/restore-firestore.mjs <backup.json> [--apply]');
if (!projectId) throw new Error('FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT is required.');

const backup = JSON.parse(await readFile(inputPath, 'utf8'));
if (backup.projectId !== projectId || backup.documentCount !== backup.documents?.length) {
  throw new Error('Backup project or document count does not match the restore target.');
}

console.log(`Restore plan: ${backup.documentCount} documents -> ${projectId}`);
if (!apply) {
  console.log('Dry run only. Add --apply and set RESTORE_CONFIRM_PROJECT to the target project ID.');
  process.exit(0);
}
if (process.env.RESTORE_CONFIRM_PROJECT !== projectId) {
  throw new Error('RESTORE_CONFIRM_PROJECT must exactly match the target project ID.');
}

if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId });
const database = getFirestore();
for (let index = 0; index < backup.documents.length; index += 400) {
  const batch = database.batch();
  for (const document of backup.documents.slice(index, index + 400)) {
    batch.set(database.doc(document.path), decodeValue(document.data, database), { merge: false });
  }
  await batch.commit();
}
console.log(`Restore complete: ${backup.documentCount} documents written; no extra documents deleted.`);
