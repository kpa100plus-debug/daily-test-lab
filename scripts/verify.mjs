import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const outputDirectory = path.join(projectRoot, 'dist');

const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  '_headers',
  'assets/css/app.css',
  'assets/js/app.js',
  'assets/js/firebase-client.js',
  'assets/js/firebase-config.js',
  'test/index.html',
  'vote/index.html',
  'game/index.html',
  'admin/index.html',
  'legal/privacy/index.html',
  'legal/terms/index.html',
  'legal/ads/index.html',
  'contact/index.html',
  'data/tests.json',
  'data/balance-games.json',
  'data/daily-content.json'
];

for (const relativePath of requiredFiles) {
  await access(path.join(outputDirectory, relativePath));
}

const indexHtml = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
if (!indexHtml.includes('DAILY TEST LAB')) {
  throw new Error('index.html brand text is missing.');
}

for (const requiredText of [
  '오늘 테스트',
  '밸런스 게임',
  '10초 게임',
  '오늘의 퀴즈',
  '오늘의 나'
]) {
  if (!indexHtml.includes(requiredText)) {
    throw new Error(`index.html required menu is missing: ${requiredText}`);
  }
}

const appJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/app.js'),
  'utf8'
);
if (!appJavaScript.includes('REF-DAILYFUN-STEP2-HOME-01')) {
  throw new Error('STEP 2 homepage script reference is missing.');
}

for (const fileName of ['tests.json', 'balance-games.json', 'daily-content.json']) {
  JSON.parse(await readFile(path.join(outputDirectory, 'data', fileName), 'utf8'));
}

const dailyContent = JSON.parse(
  await readFile(path.join(outputDirectory, 'data/daily-content.json'), 'utf8')
);
if (!Array.isArray(dailyContent.items) || dailyContent.items.length < 5) {
  throw new Error('At least 5 daily content items are required.');
}

const dailyContentIds = dailyContent.items.map((item) => item.id);
if (new Set(dailyContentIds).size !== dailyContentIds.length) {
  throw new Error('Daily content item IDs must be unique.');
}

console.log(`Verification complete: ${requiredFiles.length} required files`);
