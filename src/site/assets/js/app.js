const buildStep = 'REF-DAILYFUN-STEP1-ENV-01';

import { getFirebaseServices } from './firebase-client.js';

document.documentElement.dataset.buildStep = buildStep;

if (globalThis.location.hostname === 'localhost') {
  console.info(`DAILY TEST LAB ready: ${buildStep}`);
}

getFirebaseServices().catch((error) => {
  console.warn('Firebase 초기화 지연:', error.message);
});
