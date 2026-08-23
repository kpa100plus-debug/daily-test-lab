const buildStep = 'REF-DAILYFUN-STEP1-ENV-01';

document.documentElement.dataset.buildStep = buildStep;

if (globalThis.location.hostname === 'localhost') {
  console.info(`DAILY TEST LAB ready: ${buildStep}`);
}

