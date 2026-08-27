import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const outputDirectory = path.join(projectRoot, 'dist');

const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'CNAME',
  'sitemap.xml',
  '_headers',
  'assets/css/app.css',
  'assets/js/app.js',
  'assets/js/locale.js',
  'assets/js/share-service.js',
  'assets/js/test-list.js',
  'assets/js/test-app.js',
  'assets/js/test-engine.js',
  'assets/js/balance-app.js',
  'assets/js/balance-engine.js',
  'assets/js/game-list.js',
  'assets/js/game-app.js',
  'assets/js/mini-game-engine.js',
  'assets/js/score-engine.js',
  'assets/js/member-service.js',
  'assets/js/member-chip.js',
  'assets/js/my-app.js',
  'assets/js/daily-content-engine.js',
  'assets/js/content-admin-engine.js',
  'assets/js/content-repository.js',
  'assets/js/admin-app.js',
  'assets/js/firebase-client.js',
  'assets/js/firebase-config.js',
  'test/index.html',
  'vote/index.html',
  'game/index.html',
  'my/index.html',
  'admin/index.html',
  'about/index.html',
  'legal/privacy/index.html',
  'legal/terms/index.html',
  'legal/ads/index.html',
  'contact/index.html',
  'data/tests.json',
  'data/balance-games.json',
  'data/mini-games.json',
  'data/daily-content.json'
];

for (const sourceFile of [
  'firestore.lockdown.rules',
  'firebase.lockdown.json',
  'scripts/backup-crypto.mjs',
  'scripts/backup-firestore.mjs',
  'scripts/restore-firestore.mjs',
  'scripts/scan-secrets.mjs',
  'tests/firestore.rules.test.mjs',
  'tests/firestore.lockdown.rules.test.mjs',
  'tests/backup-crypto.test.mjs'
]) {
  await access(path.join(projectRoot, sourceFile));
}

for (const relativePath of requiredFiles) {
  await access(path.join(outputDirectory, relativePath));
}

const copyrightNotice = '© 2026 ISEA GROUP. All rights reserved.';
const generatedSiteFiles = await readdir(outputDirectory, { recursive: true });
for (const relativePath of generatedSiteFiles.filter((file) => file.endsWith('.html'))) {
  const html = await readFile(path.join(outputDirectory, relativePath), 'utf8');
  const withoutCopyright = html.replaceAll(copyrightNotice, '');
  if (
    withoutCopyright.includes('㈜ISEA GROUP') ||
    withoutCopyright.includes('ISEA GROUP')
  ) {
    throw new Error(`Corporate name must appear only in the copyright notice: ${relativePath}`);
  }
  if (html.includes('All Rights Reserved.')) {
    throw new Error(`Copyright capitalization is outdated: ${relativePath}`);
  }
  if (/juyoungkim|김주영/i.test(html)) {
    throw new Error(`Personal administrator name must not be public: ${relativePath}`);
  }
}

const indexHtml = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
if (!indexHtml.includes('DAILY TEST LAB')) {
  throw new Error('index.html brand text is missing.');
}

const headersText = await readFile(path.join(outputDirectory, '_headers'), 'utf8');
if (
  !headersText.includes("Content-Security-Policy: upgrade-insecure-requests; object-src 'none'") ||
  !headersText.includes('Strict-Transport-Security: max-age=31536000') ||
  !headersText.includes('/admin/*') ||
  !headersText.includes('Cache-Control: no-store') ||
  !headersText.includes('X-Robots-Tag: noindex, nofollow')
) {
  throw new Error('Static-host security headers are incomplete.');
}

const workflowDirectory = path.join(projectRoot, '.github', 'workflows');
for (const workflowFile of (await readdir(workflowDirectory)).filter((name) => name.endsWith('.yml'))) {
  const workflow = await readFile(path.join(workflowDirectory, workflowFile), 'utf8');
  for (const match of workflow.matchAll(/^\s*uses:\s*[^@\s]+@([^\s#]+)/gm)) {
    if (!/^[0-9a-f]{40}$/.test(match[1])) {
      throw new Error(`GitHub Action must be pinned to a full commit SHA: ${workflowFile}`);
    }
  }
}

if (!indexHtml.includes('https://dailytestlabkr.blogspot.com/')) {
  throw new Error('Blogger reading hub link is missing from the main site.');
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
if (
  !appJavaScript.includes('REF-DAILYFUN-STEP7-ADMIN-DAILY-01') ||
  !appJavaScript.includes("'daily_contents'")
) {
  throw new Error('STEP 7 Firebase daily content connection is missing.');
}

const localeJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/locale.js'),
  'utf8'
);
if (
  !indexHtml.includes('global-visitor-count') ||
  !indexHtml.includes('weekly-visitor-count') ||
  !indexHtml.includes('monthly-visitor-count') ||
  !indexHtml.includes('published-test-count') ||
  !appJavaScript.includes('counterapi.com/api/dtlabkr.dpdns.org/view/home') ||
  !appJavaScript.includes("fetchVisitorCount('7d', true)") ||
  !appJavaScript.includes("fetchVisitorCount('30d', true)") ||
  !appJavaScript.includes("parameters.set('readOnly', 'true')") ||
  !appJavaScript.includes('updateServiceStats') ||
  !localeJavaScript.includes("'zh-CN'") ||
  !localeJavaScript.includes("'ar'") ||
  !localeJavaScript.includes('countries.dev/ip') ||
  !localeJavaScript.includes('site-language-selector')
) {
  throw new Error('Multilingual interface or meaningful service counters are incomplete.');
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
const miniGameEnginePath = path.join(outputDirectory, 'assets/js/mini-game-engine.js');
const {
  createNumberBoard,
  createReactionDelay,
  extendMemorySequence,
  formatGameScore,
  getGameRating,
  isBetterScore
} = await import(pathToFileURL(miniGameEnginePath).href);
const scoreEnginePath = path.join(outputDirectory, 'assets/js/score-engine.js');
const {
  mergeScoreCollections,
  mergeScoreRecords,
  selectBestScore
} = await import(pathToFileURL(scoreEnginePath).href);
const dailyContentEnginePath = path.join(outputDirectory, 'assets/js/daily-content-engine.js');
const {
  createDailyContentDocument,
  hasScheduledDailyContent,
  isSafeDailyRoute,
  normalizeDailyContent,
  selectDailyContentItem
} = await import(pathToFileURL(dailyContentEnginePath).href);

const datedDailyFixture = {
  activeDate: '2026-08-26',
  activeItemId: 'dated-feature',
  items: [
    { id: 'dated-feature' },
    { id: 'rotation-fallback' }
  ]
};
if (
  selectDailyContentItem(datedDailyFixture, '2026-08-26')?.id !== 'dated-feature' ||
  selectDailyContentItem(datedDailyFixture, '2026-08-27')?.id !== 'rotation-fallback' ||
  !hasScheduledDailyContent(datedDailyFixture, '2026-08-26') ||
  hasScheduledDailyContent(datedDailyFixture, '2026-08-27')
) {
  throw new Error('Date-scoped daily content selection failed.');
}
const contentAdminEnginePath = path.join(outputDirectory, 'assets/js/content-admin-engine.js');
const {
  createBalanceDocument,
  createBlankTest,
  createTestDocuments,
  findAvailableSlot,
  formatScoreMapping,
  parseScoreMapping
} = await import(pathToFileURL(contentAdminEnginePath).href);
const contentRepositoryPath = path.join(outputDirectory, 'assets/js/content-repository.js');
const { mergePublishedContent } = await import(pathToFileURL(contentRepositoryPath).href);
if (
  !testListJavaScript.includes('REF-DAILYFUN-STEP8-CONTENT-CRUD-01') ||
  !testAppJavaScript.includes('REF-DAILYFUN-STEP8-CONTENT-CRUD-01') ||
  !testListJavaScript.includes('loadPublishedTests') ||
  !testAppJavaScript.includes('loadTestBundle')
) {
  throw new Error('STEP 8 Firebase test content connection is missing.');
}

for (const fileName of ['tests.json', 'balance-games.json', 'mini-games.json', 'daily-content.json']) {
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

const normalizedDailyContent = normalizeDailyContent(dailyContent.items[0]);
const dailyDocument = createDailyContentDocument(
  dailyContent.items[0],
  'admin-user',
  'server-time'
);
if (
  normalizedDailyContent.status !== 'published' ||
  dailyDocument.updatedBy !== 'admin-user' ||
  dailyDocument.updatedAt !== 'server-time' ||
  !isSafeDailyRoute('/game/reaction-speed/') ||
  isSafeDailyRoute('https://example.com/')
) {
  throw new Error('Daily content validation engine failed.');
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

const sampleTestDocuments = createTestDocuments(
  publishedTests[0],
  'published',
  'admin-user',
  'server-time'
);
const blankTest = createBlankTest(findAvailableSlot('test', testSlugs));
const parsedScores = parseScoreMapping('type-a:2, type-b:1');
if (
  sampleTestDocuments.metadata.questionCount !== publishedTests[0].questions.length ||
  sampleTestDocuments.questions.testId !== publishedTests[0].slug ||
  sampleTestDocuments.results.items.length !== publishedTests[0].results.length ||
  blankTest.status !== 'draft' ||
  blankTest.slug !== 'test-slot-001' ||
  parsedScores['type-a'] !== 2 ||
  formatScoreMapping(parsedScores) !== 'type-a:2, type-b:1'
) {
  throw new Error('STEP 8 test CRUD validation engine failed.');
}

const mergedContent = mergePublishedContent(
  [{ slug: 'static-a', status: 'published' }],
  [{ slug: 'static-a', status: 'archived' }, { slug: 'remote-b', status: 'published' }]
);
if (mergedContent.length !== 1 || mergedContent[0].slug !== 'remote-b') {
  throw new Error('Firebase/static content overlay failed.');
}

for (const relativePath of [
  'test/test-slot-001/index.html',
  'test/test-slot-001/result/index.html',
  'test/test-slot-050/index.html'
]) {
  await access(path.join(outputDirectory, relativePath));
}

const testListHtml = await readFile(path.join(outputDirectory, 'test/index.html'), 'utf8');
if (!testListHtml.includes('test-list.js') || !testListHtml.includes('나에게 맞는 테스트')) {
  throw new Error('Test list page is incomplete.');
}

const balanceAppJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/balance-app.js'),
  'utf8'
);
if (
  !balanceAppJavaScript.includes('REF-DAILYFUN-STEP8-CONTENT-CRUD-01') ||
  !balanceAppJavaScript.includes('loadPublishedBalanceGames')
) {
  throw new Error('STEP 8 Firebase balance content connection is missing.');
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

const sampleBalanceDocument = createBalanceDocument(
  publishedBalanceGames[0],
  'published',
  'admin-user',
  'server-time'
);
if (
  sampleBalanceDocument.slug !== publishedBalanceGames[0].slug ||
  sampleBalanceDocument.options[0].id !== 'a' ||
  findAvailableSlot('balance', balanceSlugs) !== 'balance-slot-001'
) {
  throw new Error('STEP 8 balance CRUD validation engine failed.');
}

for (const relativePath of [
  'vote/balance-slot-001/index.html',
  'vote/balance-slot-120/index.html'
]) {
  await access(path.join(outputDirectory, relativePath));
}

const blankBalanceHtml = await readFile(
  path.join(outputDirectory, 'vote/balance-slot-001/index.html'),
  'utf8'
);
if (
  !blankBalanceHtml.includes('<title>새 밸런스 게임 | DAILY TEST LAB</title>') ||
  blankBalanceHtml.includes('| DAILY TEST LAB | DAILY TEST LAB')
) {
  throw new Error('Blank balance slot title must contain a single service-name suffix.');
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

const miniGameData = JSON.parse(
  await readFile(path.join(outputDirectory, 'data/mini-games.json'), 'utf8')
);
const publishedMiniGames = (miniGameData.items || []).filter((game) => game.status === 'published');
const requiredMiniGameSlugs = ['reaction-speed', 'memory', 'number-order'];
const publishedMiniGameSlugs = publishedMiniGames.map((game) => game.slug);
if (
  publishedMiniGames.length !== 3 ||
  requiredMiniGameSlugs.some((slug) => !publishedMiniGameSlugs.includes(slug))
) {
  throw new Error('The three required mini games are missing.');
}

for (const game of publishedMiniGames) {
  if (!game.seo?.title || !game.seo?.description || !game.shareText) {
    throw new Error(`Mini game SEO or sharing data is missing: ${game.slug}`);
  }
  if (!['lower', 'higher'].includes(game.scoreDirection)) {
    throw new Error(`Invalid mini game score direction: ${game.slug}`);
  }
  const detailHtml = await readFile(
    path.join(outputDirectory, 'game', game.slug, 'index.html'),
    'utf8'
  );
  if (!detailHtml.includes(game.title) || !detailHtml.includes('game-app.js')) {
    throw new Error(`Generated mini game detail is incomplete: ${game.slug}`);
  }
}

const gameListHtml = await readFile(path.join(outputDirectory, 'game/index.html'), 'utf8');
if (!gameListHtml.includes('game-list.js') || !gameListHtml.includes('오늘의 3가지 도전')) {
  throw new Error('Mini game list page is incomplete.');
}

const buildJavaScript = await readFile(path.join(projectRoot, 'scripts/build.mjs'), 'utf8');
const balanceListShareHtml = await readFile(path.join(outputDirectory, 'vote/index.html'), 'utf8');
const gameAppJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/game-app.js'),
  'utf8'
);
const shareServicePath = path.join(outputDirectory, 'assets/js/share-service.js');
const shareServiceJavaScript = await readFile(shareServicePath, 'utf8');
const { buildShareText } = await import(pathToFileURL(shareServicePath).href);
if (
  buildShareText({ text: '기록 7.60초', url: 'https://dtlabkr.dpdns.org/game/number-order/' }) !==
    '기록 7.60초\n\nhttps://dtlabkr.dpdns.org/game/number-order/' ||
  !shareServiceJavaScript.includes('navigator.userAgentData?.mobile') ||
  !shareServiceJavaScript.includes('navigator.clipboard?.writeText') ||
  !shareServiceJavaScript.includes("document.execCommand('copy')") ||
  !appJavaScript.includes("from './share-service.js'") ||
  !testAppJavaScript.includes("from './share-service.js'") ||
  !balanceAppJavaScript.includes("from './share-service.js'") ||
  !gameAppJavaScript.includes("from './share-service.js'") ||
  !indexHtml.includes('app.js?v=share-1') ||
  !balanceListShareHtml.includes('balance-app.js?v=share-1') ||
  !buildJavaScript.includes('test-app.js?v=share-1') ||
  !buildJavaScript.includes('game-app.js?v=share-1')
) {
  throw new Error('Reliable share and copy fallback is incomplete.');
}

const memberServiceJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/member-service.js'),
  'utf8'
);
if (
  !gameAppJavaScript.includes('REF-DAILYFUN-STEP6-MEMBER-SCORE-01') ||
  !gameAppJavaScript.includes('saveGameAttempt') ||
  !memberServiceJavaScript.includes('signInWithGoogle') ||
  !memberServiceJavaScript.includes("'game_scores'")
) {
  throw new Error('STEP 6 member score connection is incomplete.');
}

const numberBoard = createNumberBoard(12, () => 0.25);
const memorySequence = extendMemorySequence([0, 1], 6, () => 0.5);
if (
  new Set(numberBoard).size !== 12 ||
  numberBoard.some((number) => number < 1 || number > 12) ||
  createReactionDelay(() => 0, 1500, 3500) !== 1500 ||
  memorySequence.join(',') !== '0,1,3' ||
  !isBetterScore('lower', 210, 250) ||
  !isBetterScore('higher', 6, 5) ||
  formatGameScore('reaction-speed', 217) !== '217ms' ||
  formatGameScore('memory', 5) !== '5단계' ||
  getGameRating('number-order', 4500).title !== '숫자 탐색 달인'
) {
  throw new Error('Mini game calculation engine failed.');
}

const lowerMerged = mergeScoreRecords(
  'lower',
  { best: 240, last: 260, attempts: 3, updatedAt: '2026-08-23T08:00:00Z' },
  { best: 220, last: 220, attempts: 5, updatedAt: '2026-08-23T07:00:00Z' }
);
const mergedCollections = mergeScoreCollections(
  publishedMiniGames,
  { memory: { best: 4, last: 4, attempts: 2 } },
  { memory: { best: 6, last: 6, attempts: 4 } }
);
const remoteOnly = mergeScoreRecords(
  'higher',
  {},
  { best: 5, last: 4, attempts: 3, updatedAt: { seconds: 1787472000, nanoseconds: 0 } }
);
if (
  lowerMerged.best !== 220 ||
  lowerMerged.last !== 260 ||
  lowerMerged.attempts !== 5 ||
  mergedCollections.memory.best !== 6 ||
  mergedCollections.memory.attempts !== 4 ||
  remoteOnly.best !== 5 ||
  remoteOnly.last !== 4 ||
  remoteOnly.attempts !== 3 ||
  selectBestScore('higher', 4, 7) !== 7
) {
  throw new Error('Member score merge engine failed.');
}

const myPageHtml = await readFile(path.join(outputDirectory, 'my/index.html'), 'utf8');
const myAppJavaScript = await readFile(path.join(outputDirectory, 'assets/js/my-app.js'), 'utf8');
const privacyHtml = await readFile(path.join(outputDirectory, 'legal/privacy/index.html'), 'utf8');
const termsHtml = await readFile(path.join(outputDirectory, 'legal/terms/index.html'), 'utf8');
const contactHtml = await readFile(path.join(outputDirectory, 'contact/index.html'), 'utf8');
const aboutHtml = await readFile(path.join(outputDirectory, 'about/index.html'), 'utf8');
const adsPolicyHtml = await readFile(path.join(outputDirectory, 'legal/ads/index.html'), 'utf8');
if (
  !myPageHtml.includes('my-app.js') ||
  !myAppJavaScript.includes('Google로 기록 보관') ||
  privacyHtml.includes('㈜ISEA GROUP') ||
  !privacyHtml.includes('Firebase 사용자 식별값') ||
  !privacyHtml.includes('서비스 운영자가 개인정보 관련 요청을 처리·관리합니다') ||
  !termsHtml.includes('서비스 운영 문의는 문의 페이지에서 접수합니다') ||
  !contactHtml.includes('운영·개인정보 문의:') ||
  !contactHtml.includes('daily-test-lab/issues/new') ||
  !aboutHtml.includes('운영팀이 테스트 질문') ||
  !adsPolicyHtml.includes('<h2>광고·제휴 문의</h2>') ||
  [privacyHtml, termsHtml, contactHtml, aboutHtml, adsPolicyHtml].some((html) =>
    html.includes('김주영') || html.includes('kpa100plus@gmail.com')
  )
) {
  throw new Error('Member dashboard or privacy disclosure is incomplete.');
}

const adminPageHtml = await readFile(path.join(outputDirectory, 'admin/index.html'), 'utf8');
const adminAppJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/admin-app.js'),
  'utf8'
);
if (
  !adminPageHtml.includes('admin-app.js') ||
  adminPageHtml.includes('㈜ISEA GROUP') ||
  !adminAppJavaScript.includes('REF-DAILYFUN-STEP8-CONTENT-CRUD-01') ||
  adminAppJavaScript.includes('kpa100plus@gmail.com') ||
  adminAppJavaScript.includes('승인 계정:') ||
  !adminAppJavaScript.includes('hasFirestoreAdminAccess') ||
  !adminAppJavaScript.includes("where('status', '==', 'draft')") ||
  !adminAppJavaScript.includes("'daily_contents'") ||
  !adminAppJavaScript.includes("'test_questions'") ||
  !adminAppJavaScript.includes("'test_results'") ||
  !adminAppJavaScript.includes("'balance_content'") ||
  !adminAppJavaScript.includes("'juyoungkim'") ||
  !adminAppJavaScript.includes("provider.providerId === 'google.com'") ||
  !adminAppJavaScript.includes('currentUser.getIdToken(true)') ||
  adminAppJavaScript.includes('김주영 관리자')
) {
  throw new Error('STEP 8 integrated administrator CRUD is incomplete.');
}

const firebaseConfigJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/firebase-config.js'),
  'utf8'
);
const firebaseClientJavaScript = await readFile(
  path.join(outputDirectory, 'assets/js/firebase-client.js'),
  'utf8'
);
if (
  !firebaseConfigJavaScript.includes("provider: 'recaptcha-enterprise'") ||
  !firebaseConfigJavaScript.includes("enforcement: 'monitoring'") ||
  !/siteKey: '(?:[A-Za-z0-9_-]{20,})?'/.test(firebaseConfigJavaScript) ||
  !firebaseClientJavaScript.includes('firebase-app-check.js') ||
  !firebaseClientJavaScript.includes('ReCaptchaEnterpriseProvider') ||
  !firebaseClientJavaScript.includes('isTokenAutoRefreshEnabled: true')
) {
  throw new Error('App Check monitoring preparation is incomplete.');
}

if (
  !testAppJavaScript.includes('새 테스트를 준비 중이에요') ||
  !balanceAppJavaScript.includes('새 밸런스게임을 준비 중이에요')
) {
  throw new Error('STEP 8 unpublished content slot fallback is incomplete.');
}

const defaultPublicSiteUrl = 'https://dtlabkr.dpdns.org';
const cloudflarePagesUrl = process.env.CF_PAGES === '1'
  ? process.env.CF_PAGES_URL
  : '';
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || cloudflarePagesUrl || defaultPublicSiteUrl)
  .replace(/\/$/, '');
const staticIndexableRoutes = [
  '/',
  '/test/',
  '/vote/',
  '/game/',
  '/fortune/',
  '/tarot/',
  '/about/',
  '/legal/privacy/',
  '/legal/terms/',
  '/legal/ads/',
  '/contact/'
];
const expectedIndexableRoutes = [
  ...staticIndexableRoutes,
  ...publishedTests.map((test) => `/test/${test.slug}/`),
  ...publishedBalanceGames.map((game) => `/vote/${game.slug}/`),
  ...publishedMiniGames.map((game) => `/game/${game.slug}/`)
];

function routeToHtmlPath(route) {
  return route === '/' ? 'index.html' : `${route.replace(/^\//, '')}index.html`;
}

for (const route of expectedIndexableRoutes) {
  const html = await readFile(path.join(outputDirectory, routeToHtmlPath(route)), 'utf8');
  const canonical = `${publicSiteUrl}${route}`;
  if (
    !/<meta name="robots" content="index,follow,[^"]+">/.test(html) ||
    !html.includes(`<link rel="canonical" href="${canonical}">`) ||
    !html.includes(`<meta property="og:url" content="${canonical}">`) ||
    !html.includes('<meta property="og:site_name" content="DAILY TEST LAB">') ||
    !html.includes('<meta name="twitter:card" content="summary">')
  ) {
    throw new Error(`Indexable SEO metadata is incomplete: ${route}`);
  }
  if (
    !html.includes('<meta name="referrer" content="strict-origin-when-cross-origin">') ||
    !html.includes('<meta http-equiv="Content-Security-Policy"')
  ) {
    throw new Error(`Security metadata is incomplete: ${route}`);
  }

  const structuredDataMatches = [...html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  )];
  if (structuredDataMatches.length !== 1) {
    throw new Error(`Exactly one JSON-LD graph is required: ${route}`);
  }
  const structuredData = JSON.parse(structuredDataMatches[0][1]);
  const graphTypes = new Set((structuredData['@graph'] || []).map((item) => item['@type']));
  if (!graphTypes.has('Organization') || !graphTypes.has('WebSite')) {
    throw new Error(`Publisher JSON-LD is missing: ${route}`);
  }
  if (route !== '/' && !graphTypes.has('BreadcrumbList')) {
    throw new Error(`Breadcrumb JSON-LD is missing: ${route}`);
  }
}

for (const relativePath of [
  'admin/index.html',
  'my/index.html',
  '404.html',
  'test/hidden-energy/result/index.html',
  'test/test-slot-001/index.html',
  'test/test-slot-001/result/index.html',
  'vote/balance-slot-001/index.html'
]) {
  const html = await readFile(path.join(outputDirectory, relativePath), 'utf8');
  if (!/<meta name="robots" content="noindex(?:,nofollow)?">/.test(html)) {
    throw new Error(`Private or unpublished page must remain noindex: ${relativePath}`);
  }
  if (
    !html.includes('<meta name="referrer" content="strict-origin-when-cross-origin">') ||
    !html.includes('<meta http-equiv="Content-Security-Policy"')
  ) {
    throw new Error(`Private page security metadata is incomplete: ${relativePath}`);
  }
}

const sitemapXml = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedSitemapUrls = expectedIndexableRoutes.map((route) => `${publicSiteUrl}${route}`);
if (
  sitemapUrls.length !== expectedSitemapUrls.length ||
  new Set(sitemapUrls).size !== sitemapUrls.length ||
  expectedSitemapUrls.some((url) => !sitemapUrls.includes(url)) ||
  sitemapUrls.some((url) => /\/admin\/|\/my\/|\/result\/|test-slot-|balance-slot-/.test(url))
) {
  throw new Error('sitemap.xml must contain only the current published canonical URLs.');
}

const robotsText = await readFile(path.join(outputDirectory, 'robots.txt'), 'utf8');
const cnameText = await readFile(path.join(outputDirectory, 'CNAME'), 'utf8');
if (cnameText.trim() !== new URL(publicSiteUrl).hostname) {
  throw new Error('CNAME must match the public site hostname.');
}
const publicPath = new URL(publicSiteUrl).pathname.replace(/\/$/, '') || '/';
const expectedAllowRule = `Allow: ${publicPath === '/' ? '/' : `${publicPath}/`}`;
if (
  !robotsText.includes(expectedAllowRule) ||
  !robotsText.includes(`Sitemap: ${publicSiteUrl}/sitemap.xml`) ||
  robotsText.includes('Disallow: /')
) {
  throw new Error('robots.txt public crawl configuration is incomplete.');
}

if (
  !testListHtml.includes(`/test/${publishedTests[0].slug}/`) ||
  !balanceListHtml.includes(`/vote/${publishedBalanceGames[0].slug}/`) ||
  !gameListHtml.includes(`/game/${publishedMiniGames[0].slug}/`)
) {
  throw new Error('Static crawlable catalog links are missing.');
}

if (
  !privacyHtml.includes('운영자가 측정 ID 또는 광고 게시자 ID를 설정한 경우에만') ||
  !privacyHtml.includes('쿠키·로컬 저장소와 광고') ||
  !termsHtml.includes('광고 클릭 유도나 클릭 보상은 제공하지 않습니다.') ||
  !adsPolicyHtml.includes('승인 전에는 빈 광고 상자나 클릭 대상을 노출하지 않습니다.') ||
  !aboutHtml.includes('자체 질문·결과 문구')
) {
  throw new Error('AdSense privacy and advertising disclosures are incomplete.');
}

const rules = await readFile(path.join(projectRoot, 'firestore.rules'), 'utf8');
const lockdownRules = await readFile(path.join(projectRoot, 'firestore.lockdown.rules'), 'utf8');
if (
  !rules.includes('match /balance_games/{gameId}') ||
  !rules.includes('match /votes/{voteId}') ||
  !rules.includes('match /users/{userId}') ||
  !rules.includes('match /game_scores/{userId}/scores/{gameId}') ||
  !rules.includes('match /daily_contents/{documentId}') ||
  !rules.includes('match /tests/{testSlug}') ||
  !rules.includes('match /test_questions/{testSlug}') ||
  !rules.includes('match /test_results/{testSlug}') ||
  !rules.includes('match /balance_content/{gameSlug}') ||
  !rules.includes('function isAdmin()') ||
  !rules.includes("request.auth.token.email == 'kpa100plus@gmail.com'") ||
  !rules.includes('request.auth.token.email_verified == true') ||
  rules.includes('request.auth.token.firebase.sign_in_provider') ||
  !rules.includes('allow get: if signedIn()') ||
  !rules.includes('allow list: if false;')
) {
  throw new Error('Firestore security rules are incomplete.');
}
if (
  !rules.includes('function hasVerifiedEmail()') ||
  !rules.includes('request.resource.data.email == request.auth.token.email') ||
  !rules.includes('request.resource.data.attempts <= 1000000') ||
  !lockdownRules.includes('사고 대응용 읽기 전용 규칙') ||
  !lockdownRules.includes('allow write: if false;')
) {
  throw new Error('Firestore hardening or lockdown rules are incomplete.');
}

const buildMeta = JSON.parse(await readFile(path.join(outputDirectory, 'build-meta.json'), 'utf8'));
const expectedAppCheck = /siteKey: '[A-Za-z0-9_-]{20,}'/.test(firebaseConfigJavaScript);
if (
  buildMeta.build !== 'step-12-adsense-readiness' ||
  buildMeta.publicSiteUrl !== publicSiteUrl ||
  buildMeta.indexableUrlCount !== expectedIndexableRoutes.length ||
  buildMeta.integrations.firebaseAppCheck !== expectedAppCheck ||
  buildMeta.adsenseReadiness.applicationUrlHasPath !== (new URL(publicSiteUrl).pathname !== '/') ||
  buildMeta.adsenseReadiness.hostRootAssetsAvailable !== (new URL(publicSiteUrl).pathname === '/')
) {
  throw new Error('STEP 12 build metadata is missing.');
}

const hasAdsTxt = await access(path.join(outputDirectory, 'ads.txt')).then(
  () => true,
  () => false
);
const monetizableRoutes = [
  '/',
  '/test/',
  '/vote/',
  '/game/',
  ...publishedTests.map((test) => `/test/${test.slug}/`),
  ...publishedTests.map((test) => `/test/${test.slug}/result/`),
  ...publishedBalanceGames.map((game) => `/vote/${game.slug}/`),
  ...publishedMiniGames.map((game) => `/game/${game.slug}/`)
];
const nonMonetizableRoutes = ['/about/', '/legal/privacy/', '/legal/terms/', '/legal/ads/', '/contact/'];

for (const route of [...monetizableRoutes, ...nonMonetizableRoutes]) {
  const html = await readFile(path.join(outputDirectory, routeToHtmlPath(route)), 'utf8');
  if (
    html.includes('ad-placeholder') ||
    html.includes('광고 게재 예정 영역') ||
    html.includes('ADSENSE_SLOT:')
  ) {
    throw new Error(`Unfinished advertising placeholder remains: ${route}`);
  }

  if (!buildMeta.integrations.adsense && (
    html.includes('pagead2.googlesyndication.com') ||
    html.includes('google-adsense-account') ||
    html.includes('class="adsbygoogle"')
  )) {
    throw new Error(`AdSense must remain disabled without a real client ID: ${route}`);
  }
}

if (!buildMeta.integrations.adsense && hasAdsTxt) {
  throw new Error('ads.txt must not be generated without a real publisher ID.');
}

if (buildMeta.integrations.adsense) {
  for (const route of monetizableRoutes) {
    const html = await readFile(path.join(outputDirectory, routeToHtmlPath(route)), 'utf8');
    if (
      !html.includes('meta name="google-adsense-account"') ||
      !html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')
    ) {
      throw new Error(`AdSense verification code is missing: ${route}`);
    }
  }

  for (const route of nonMonetizableRoutes) {
    const html = await readFile(path.join(outputDirectory, routeToHtmlPath(route)), 'utf8');
    if (html.includes('pagead2.googlesyndication.com') || html.includes('class="adsbygoogle"')) {
      throw new Error(`Policy or contact page must remain ad-free: ${route}`);
    }
  }

  if (buildMeta.integrations.adsTxt !== hasAdsTxt) {
    throw new Error('ads.txt build state does not match the publisher configuration.');
  }
}

console.log(`Verification complete: ${requiredFiles.length} required files`);

