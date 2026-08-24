import { writeFile } from 'node:fs/promises';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? '' : process.argv[index + 1] || '';
}

function encodeValue(value) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (value instanceof Date) return { __type: 'date', value: value.toISOString() };
  if (Array.isArray(value)) return value.map(encodeValue);
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return { __type: 'bytes', value: Buffer.from(value).toString('base64') };
  }
  if (typeof value?.toDate === 'function' && typeof value?.seconds === 'number') {
    return { __type: 'timestamp', value: value.toDate().toISOString() };
  }
  if (typeof value?.latitude === 'number' && typeof value?.longitude === 'number') {
    return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  }
  if (typeof value?.path === 'string' && value?.firestore) {
    return { __type: 'reference', path: value.path };
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, encodeValue(nested)])
    );
  }
  throw new Error(`Unsupported Firestore value type: ${typeof value}`);
}

async function collectCollection(collectionReference, documents) {
  const documentReferences = await collectionReference.listDocuments();
  for (const documentReference of documentReferences.sort((left, right) => left.path.localeCompare(right.path))) {
    const snapshot = await documentReference.get();
    if (snapshot.exists) {
      documents.push({ path: documentReference.path, data: encodeValue(snapshot.data()) });
    }
    const childCollections = await documentReference.listCollections();
    for (const childCollection of childCollections.sort((left, right) => left.path.localeCompare(right.path))) {
      await collectCollection(childCollection, documents);
    }
  }
}

const outputPath = readArgument('--output');
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
if (!outputPath) throw new Error('--output is required.');
if (!projectId) throw new Error('FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT is required.');

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId });
}

const database = getFirestore();
const documents = [];
const collections = await database.listCollections();
for (const collectionReference of collections.sort((left, right) => left.path.localeCompare(right.path))) {
  await collectCollection(collectionReference, documents);
}

documents.sort((left, right) => left.path.localeCompare(right.path));
const backup = {
  schemaVersion: 1,
  projectId,
  createdAt: new Date().toISOString(),
  documentCount: documents.length,
  documents
};
await writeFile(outputPath, `${JSON.stringify(backup)}\n`, { mode: 0o600 });
console.log(`Firestore export complete: ${documents.length} documents`);
