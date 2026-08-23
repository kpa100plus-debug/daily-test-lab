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
  'assets/js/balance-app.js',
  'assets/js/balance-engine.js',
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
const balanceEnginePath = path.join(outputDirectory, 'assets/js/balance-engine.js');
const {
  applyVote,
  calculateVotePercentages,
  selectDailyGame
} = await import(pathToFileURL(balanceEnginePath).href);
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

const balanceAppJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/balance-app.js'),
  'utf8'
);
if (!balanceAppJavaScript.includes('REF-DAILYFUN-STEP4-VOTE-01')) {
  throw new Error('STEP 4 balance game script reference is missing.');
}

const balanceData = JSON.parse(
  await readFile(path.join(outputDirectory, 'data/balance-games.json'), 'utf8')
);
if (balanceData.capacity < 100) {
  throw new Error('The balance game structure must support at least 100 questions.');
}

const publishedBalanceGames = (balanceData.items || []).filter((game) => game.status === 'published');
if (publishedBalanceGames.length < 20) {
  throw new Error('At least 20 balance games are required for the STEP 4 launch set.');
}

const balanceSlugs = publishedBalanceGames.map((game) => game.slug);
const balanceIds = publishedBalanceGames.map((game) => game.id);
if (new Set(balanceSlugs).size !== balanceSlugs.length) {
  throw new Error('Published balance game slugs must be unique.');
}
if (new Set(balanceIds).size !== balanceIds.length) {
  throw new Error('Published balance game IDs must be unique.');
}

for (const game of publishedBalanceGames) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(game.slug)) {
    throw new Error(`Invalid balance game slug: ${game.slug}`);
  }
  if (!Array.isArray(game.options) || game.options.length !== 2) {
    throw new Error(`Balance game must have exactly two options: ${game.slug}`);
  }
  if (game.options[0].id !== 'a' || game.options[1].id !== 'b') {
    throw new Error(`Balance option IDs must be a and b: ${game.slug}`);
  }
  if (!game.seo?.title || !game.seo?.description || !game.shareText) {
    throw new Error(`Balance share or SEO content is missing: ${game.slug}`);
  }

  const detailPath = path.join(outputDirectory, 'vote', game.slug, 'index.html');
  await access(detailPath);
  const detailHtml = await readFile(detailPath, 'utf8');
  if (!detailHtml.includes(game.question) || !detailHtml.includes('balance-app.js')) {
    throw new Error(`Generated balance detail is incomplete: ${game.slug}`);
  }
}

const firstVote = applyVote({}, 'a');
const secondVote = applyVote(firstVote, 'b');
const percentages = calculateVotePercentages({ a: 3, b: 1 });
if (
  firstVote.a !== 1 || firstVote.total !== 1 ||
  secondVote.a !== 1 || secondVote.b !== 1 || secondVote.total !== 2 ||
  percentages.a !== 75 || percentages.b !== 25
) {
  throw new Error('Balance vote calculation engine failed.');
}

const dailyGame = selectDailyGame(publishedBalanceGames, '2026-08-23');
if (!dailyGame || !balanceSlugs.includes(dailyGame.slug)) {
  throw new Error('Daily balance game selection failed.');
}

const balanceListHtml = await readFile(path.join(outputDirectory, 'vote/index.html'), 'utf8');
if (!balanceListHtml.includes('balance-app.js') || !balanceListHtml.includes('오늘의 밸런스')) {
  throw new Error('Balance game list page is incomplete.');
}

const rules = await readFile(path.join(projectRoot, 'firestore.rules'), 'utf8');
if (
  !rules.includes('match /balance_games/{gameId}') ||
  !rules.includes('match /votes/{voteId}') ||
  !rules.includes('allow get: if signedIn()') ||
  !rules.includes('allow list: if false;')
) {
  throw new Error('Balance vote Firestore security rules are missing.');
}

console.log(`Verification complete: ${requiredFiles.length} required files`);
