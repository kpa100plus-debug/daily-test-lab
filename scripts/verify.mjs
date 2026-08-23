import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
  'assets/js/test-list.js',
  'assets/js/test-app.js',
  'assets/js/test-engine.js',
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

const testListJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/test-list.js'),
  'utf8'
);
const testAppJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/test-app.js'),
  'utf8'
);
const testEnginePath = path.join(outputDirectory, 'assets/js/test-engine.js');
const { calculateTestResult } = await import(pathToFileURL(testEnginePath).href);
if (
  !testListJavaScript.includes('REF-DAILYFUN-STEP3-TEST-01') ||
  !testAppJavaScript.includes('REF-DAILYFUN-STEP3-TEST-01')
) {
  throw new Error('STEP 3 test script reference is missing.');
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

const testsData = JSON.parse(
  await readFile(path.join(outputDirectory, 'data/tests.json'), 'utf8')
);
if (testsData.capacity < 50) {
  throw new Error('The test content structure must support at least 50 tests.');
}

const publishedTests = (testsData.items || []).filter((test) => test.status === 'published');
if (publishedTests.length < 3) {
  throw new Error('At least 3 published tests are required for recommendations.');
}

const testSlugs = publishedTests.map((test) => test.slug);
if (new Set(testSlugs).size !== testSlugs.length) {
  throw new Error('Published test slugs must be unique.');
}

const publishedSlugSet = new Set(testSlugs);
const firstAnswerExpectations = {
  'hidden-energy': 'spark',
  'friend-view': 'sunshine',
  'work-mode': 'planner'
};
for (const test of publishedTests) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(test.slug)) {
    throw new Error(`Invalid test slug: ${test.slug}`);
  }
  if (!Array.isArray(test.questions) || test.questions.length < 6) {
    throw new Error(`At least 6 questions are required: ${test.slug}`);
  }
  if (test.questionCount !== test.questions.length) {
    throw new Error(`questionCount mismatch: ${test.slug}`);
  }
  if (!Array.isArray(test.results) || test.results.length < 4) {
    throw new Error(`At least 4 result types are required: ${test.slug}`);
  }

  const resultIds = test.results.map((result) => result.id);
  const resultIdSet = new Set(resultIds);
  if (resultIdSet.size !== resultIds.length) {
    throw new Error(`Result IDs must be unique: ${test.slug}`);
  }

  const questionIds = test.questions.map((question) => question.id);
  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error(`Question IDs must be unique: ${test.slug}`);
  }

  for (const question of test.questions) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Question options are missing: ${question.id}`);
    }
    for (const option of question.options) {
      const scoreKeys = Object.keys(option.scores || {});
      if (!scoreKeys.length || scoreKeys.some((resultId) => !resultIdSet.has(resultId))) {
        throw new Error(`Invalid score mapping: ${test.slug}/${question.id}/${option.id}`);
      }
    }
  }

  const firstAnswerResult = calculateTestResult(
    test,
    test.questions.map((question) => question.options[0])
  );
  if (
    !resultIdSet.has(firstAnswerResult.id) ||
    (test.slug in firstAnswerExpectations &&
      firstAnswerExpectations[test.slug] !== firstAnswerResult.id)
  ) {
    throw new Error(`Score engine result mismatch: ${test.slug}/${firstAnswerResult.id}`);
  }

  if ((test.recommendations || []).some((slug) => !publishedSlugSet.has(slug) || slug === test.slug)) {
    throw new Error(`Invalid test recommendation: ${test.slug}`);
  }

  const detailPath = path.join(outputDirectory, 'test', test.slug, 'index.html');
  const resultPath = path.join(outputDirectory, 'test', test.slug, 'result', 'index.html');
  await access(detailPath);
  await access(resultPath);
  const detailHtml = await readFile(detailPath, 'utf8');
  const resultHtml = await readFile(resultPath, 'utf8');
  if (!detailHtml.includes(test.title) || !detailHtml.includes('test-app.js')) {
    throw new Error(`Generated test detail is incomplete: ${test.slug}`);
  }
  if (!resultHtml.includes('data-test-view="result"') || !resultHtml.includes('test-app.js')) {
    throw new Error(`Generated test result page is incomplete: ${test.slug}`);
  }
}

const testListHtml = await readFile(path.join(outputDirectory, 'test/index.html'), 'utf8');
if (!testListHtml.includes('test-list.js') || !testListHtml.includes('나에게 맞는 테스트')) {
  throw new Error('Test list page is incomplete.');
}

console.log(`Verification complete: ${requiredFiles.length} required files`);
