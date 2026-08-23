import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceDirectory = path.join(projectRoot, 'src', 'site');
const contentDirectory = path.join(projectRoot, 'src', 'content');
const outputDirectory = path.join(projectRoot, 'dist');
const siteBasePath = (process.env.SITE_BASE_PATH ?? '').replace(/\/$/, '');

const contentFiles = [
  'tests.json',
  'balance-games.json',
  'mini-games.json',
  'daily-content.json'
];

const parsedContent = new Map();

for (const fileName of contentFiles) {
  const filePath = path.join(contentDirectory, fileName);
  parsedContent.set(fileName, JSON.parse(await readFile(filePath, 'utf8')));
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function createTestPageHtml(test, view) {
  const isResultPage = view === 'result';
  const title = isResultPage
    ? `${test.shortTitle} 결과 | DAILY TEST LAB`
    : test.seo.title;
  const description = isResultPage
    ? `${test.title} 결과를 확인하고 친구와 공유해 보세요.`
    : test.seo.description;
  const initialContent = isResultPage
    ? `
          <div class="test-loading" role="status">
            <span class="test-loading-icon" aria-hidden="true">${escapeHtml(test.icon)}</span>
            <strong>결과를 불러오고 있어요</strong>
            <p>잠시만 기다려 주세요.</p>
          </div>`
    : `
          <div class="test-intro" data-screen="intro">
            <span class="test-main-icon" aria-hidden="true">${escapeHtml(test.icon)}</span>
            <div class="test-meta-row">
              <span>${escapeHtml(test.category)}</span>
              <span>${escapeHtml(test.duration)}</span>
              <span>${test.questionCount}문항</span>
            </div>
            <p class="section-kicker">DAILY PERSONALITY TEST</p>
            <h1>${escapeHtml(test.title)}</h1>
            <p class="test-lead">${escapeHtml(test.description)}</p>
            <button class="test-start-button" type="button" data-action="start">테스트 시작하기</button>
            <p class="test-disclaimer">${escapeHtml(test.disclaimer)}</p>
          </div>`;

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#6d4aff">
    <meta name="robots" content="noindex,nofollow">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/css/app.css?v=step7-1">
  </head>
  <body class="test-detail-page" data-test-slug="${escapeHtml(test.slug)}" data-test-view="${view}">
    <header class="site-header">
      <a class="brand" href="/" aria-label="DAILY TEST LAB 홈">
        <span class="brand-mark" aria-hidden="true">D</span>
        <span>DAILY TEST LAB</span>
      </a>
      <a class="header-action" href="/test/">테스트 목록</a>
    </header>

    <main class="test-page-shell">
      <nav class="breadcrumb" aria-label="현재 위치">
        <a href="/">홈</a><span aria-hidden="true">›</span><a href="/test/">심리테스트</a><span aria-hidden="true">›</span><span>${escapeHtml(test.shortTitle)}</span>
      </nav>

      <section class="test-app-card" id="test-app" data-accent="${escapeHtml(test.accent)}" aria-live="polite">
        ${initialContent}
      </section>

      <aside class="ad-placeholder test-ad" aria-label="광고 게재 예정 영역">
        <span>AD</span><p>결과 확인을 방해하지 않는 광고 영역</p>
      </aside>

      <section class="recommend-section" aria-labelledby="recommend-title">
        <div class="section-heading">
          <div><p class="section-kicker">NEXT TEST</p><h2 id="recommend-title">이 테스트도 해보세요</h2></div>
          <a class="text-link" href="/test/">전체 보기 <span aria-hidden="true">→</span></a>
        </div>
        <div class="test-grid compact" id="recommended-tests"></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-brand"><strong>DAILY TEST LAB</strong><span>㈜ISEA GROUP 운영</span><span>© 2026 ISEA GROUP. All Rights Reserved.</span></div>
      <nav aria-label="운영 정책">
        <a href="/legal/privacy/">개인정보처리방침</a><a href="/legal/terms/">이용약관</a><a href="/legal/ads/">광고 안내</a><a href="/contact/">문의</a>
      </nav>
    </footer>

    <nav class="bottom-nav" aria-label="모바일 빠른 메뉴">
      <a href="/"><span>⌂</span>홈</a><a href="/test/" aria-current="page"><span>🧠</span>테스트</a><a href="/vote/"><span>⚖️</span>밸런스</a><a href="/game/"><span>⚡</span>게임</a><a href="/my/"><span>●</span>MY</a>
    </nav>
    <script type="module" src="/assets/js/test-app.js?v=step3-1"></script>
  </body>
</html>
`;
}

function createBalancePageHtml(game) {
  const firstOption = game.options[0];
  const secondOption = game.options[1];

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#ff5f8f">
    <meta name="robots" content="noindex,nofollow">
    <meta name="description" content="${escapeHtml(game.seo.description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(game.seo.title)}">
    <meta property="og:description" content="${escapeHtml(game.seo.description)}">
    <title>${escapeHtml(game.seo.title)} | DAILY TEST LAB</title>
    <link rel="stylesheet" href="/assets/css/app.css?v=step7-1">
  </head>
  <body class="balance-detail-page" data-balance-page="detail" data-balance-slug="${escapeHtml(game.slug)}">
    <header class="site-header">
      <a class="brand" href="/" aria-label="DAILY TEST LAB 홈">
        <span class="brand-mark" aria-hidden="true">D</span>
        <span>DAILY TEST LAB</span>
      </a>
      <a class="header-action" href="/vote/">밸런스 목록</a>
    </header>

    <main class="balance-page-shell">
      <nav class="breadcrumb" aria-label="현재 위치">
        <a href="/">홈</a><span aria-hidden="true">›</span><a href="/vote/">밸런스 게임</a><span aria-hidden="true">›</span><span>${escapeHtml(game.title)}</span>
      </nav>

      <section class="balance-app-card" id="balance-app" aria-live="polite" tabindex="-1">
        <div class="balance-question-screen" data-screen="question">
          <div class="balance-question-top"><span class="balance-category">${escapeHtml(game.category)}</span><span class="balance-once">질문별 1회 선택</span></div>
          <span class="balance-main-icon" aria-hidden="true">${escapeHtml(game.icon)}</span>
          <p class="section-kicker">BALANCE GAME</p>
          <h1>${escapeHtml(game.question)}</h1>
          <p class="balance-description">${escapeHtml(game.description)}</p>
          <div class="balance-choices">
            <button class="balance-choice balance-choice-a" type="button" data-choice="a" aria-label="${escapeHtml(firstOption.label)} 선택">
              <span class="balance-choice-emoji">${escapeHtml(firstOption.emoji)}</span><strong>${escapeHtml(firstOption.label)}</strong><small>이것을 선택</small>
            </button>
            <span class="balance-vs">VS</span>
            <button class="balance-choice balance-choice-b" type="button" data-choice="b" aria-label="${escapeHtml(secondOption.label)} 선택">
              <span class="balance-choice-emoji">${escapeHtml(secondOption.emoji)}</span><strong>${escapeHtml(secondOption.label)}</strong><small>이것을 선택</small>
            </button>
          </div>
          <p class="balance-vote-status" aria-live="polite">선택하면 바로 결과 비율을 볼 수 있어요.</p>
        </div>
      </section>

      <aside class="ad-placeholder balance-ad" aria-label="광고 게재 예정 영역">
        <span>AD</span><p>선택 결과를 방해하지 않는 광고 영역</p>
      </aside>

      <section class="balance-recommend-section" aria-labelledby="balance-recommend-title">
        <div class="section-heading">
          <div><p class="section-kicker">NEXT CHOICE</p><h2 id="balance-recommend-title">다음 밸런스도 골라보세요</h2></div>
          <a class="text-link" href="/vote/">전체 보기 <span aria-hidden="true">→</span></a>
        </div>
        <div class="balance-catalog-grid compact" id="recommended-balance-games"></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-brand"><strong>DAILY TEST LAB</strong><span>㈜ISEA GROUP 운영</span><span>© 2026 ISEA GROUP. All Rights Reserved.</span></div>
      <nav aria-label="운영 정책">
        <a href="/legal/privacy/">개인정보처리방침</a><a href="/legal/terms/">이용약관</a><a href="/legal/ads/">광고 안내</a><a href="/contact/">문의</a>
      </nav>
    </footer>

    <nav class="bottom-nav" aria-label="모바일 빠른 메뉴">
      <a href="/"><span>⌂</span>홈</a><a href="/test/"><span>🧠</span>테스트</a><a href="/vote/" aria-current="page"><span>⚖️</span>밸런스</a><a href="/game/"><span>⚡</span>게임</a><a href="/my/"><span>●</span>MY</a>
    </nav>
    <script type="module" src="/assets/js/balance-app.js?v=step4-1"></script>
  </body>
</html>
`;
}

function createMiniGamePageHtml(game, allGames) {
  const recommendations = allGames
    .filter((item) => item.status === 'published' && item.slug !== game.slug)
    .slice(0, 2)
    .map((item) => `
          <a class="mini-game-related-card" href="/game/${escapeHtml(item.slug)}/">
            <span>${escapeHtml(item.icon)}</span>
            <div><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.title)}</strong></div>
            <b aria-hidden="true">→</b>
          </a>`)
    .join('');

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f4a100">
    <meta name="robots" content="noindex,nofollow">
    <meta name="description" content="${escapeHtml(game.seo.description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(game.seo.title)}">
    <meta property="og:description" content="${escapeHtml(game.seo.description)}">
    <title>${escapeHtml(game.seo.title)} | DAILY TEST LAB</title>
    <link rel="stylesheet" href="/assets/css/app.css?v=step7-1">
  </head>
  <body class="mini-game-detail-page" data-game-slug="${escapeHtml(game.slug)}">
    <header class="site-header">
      <a class="brand" href="/" aria-label="DAILY TEST LAB 홈">
        <span class="brand-mark" aria-hidden="true">D</span>
        <span>DAILY TEST LAB</span>
      </a>
      <a class="header-action" href="/game/">게임 목록</a>
    </header>

    <main class="mini-game-page-shell">
      <nav class="breadcrumb" aria-label="현재 위치">
        <a href="/">홈</a><span aria-hidden="true">›</span><a href="/game/">10초 게임</a><span aria-hidden="true">›</span><span>${escapeHtml(game.shortTitle)}</span>
      </nav>

      <section class="mini-game-app-card" id="mini-game-app" aria-live="polite" tabindex="-1">
        <div class="mini-game-intro" data-screen="intro" data-accent="${escapeHtml(game.accent)}">
          <span class="mini-game-main-icon" aria-hidden="true">${escapeHtml(game.icon)}</span>
          <div class="mini-game-meta-row"><span>${escapeHtml(game.category)}</span><span>${escapeHtml(game.duration)}</span><span>무료 · 설치 없음</span></div>
          <p class="section-kicker">10 SECOND GAME LAB</p>
          <h1>${escapeHtml(game.title)}</h1>
          <p class="mini-game-lead">${escapeHtml(game.description)}</p>
          <div class="mini-game-intro-record"><span>${escapeHtml(game.recordLabel)}</span><strong>기록 불러오는 중</strong><small>잠시만 기다려 주세요</small></div>
          <button class="mini-game-start-button" type="button">게임 시작</button>
          <p class="mini-game-instruction">${escapeHtml(game.instruction)}</p>
        </div>
      </section>

      <aside class="ad-placeholder mini-game-ad" aria-label="광고 게재 예정 영역">
        <span>AD</span><p>게임 진행을 방해하지 않는 결과 하단 광고 영역</p>
      </aside>

      <section class="mini-game-related-section" aria-labelledby="related-game-title">
        <div class="section-heading">
          <div><p class="section-kicker">NEXT CHALLENGE</p><h2 id="related-game-title">다음 기록도 도전해 보세요</h2></div>
          <a class="text-link" href="/game/">전체 보기 <span aria-hidden="true">→</span></a>
        </div>
        <div class="mini-game-related-grid">${recommendations}</div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-brand"><strong>DAILY TEST LAB</strong><span>㈜ISEA GROUP 운영</span><span>© 2026 ISEA GROUP. All Rights Reserved.</span></div>
      <nav aria-label="운영 정책">
        <a href="/legal/privacy/">개인정보처리방침</a><a href="/legal/terms/">이용약관</a><a href="/legal/ads/">광고 안내</a><a href="/contact/">문의</a>
      </nav>
    </footer>

    <nav class="bottom-nav" aria-label="모바일 빠른 메뉴">
      <a href="/"><span>⌂</span>홈</a><a href="/test/"><span>🧠</span>테스트</a><a href="/vote/"><span>⚖️</span>밸런스</a><a href="/game/" aria-current="page"><span>⚡</span>게임</a><a href="/my/"><span>●</span>MY</a>
    </nav>
    <script type="module" src="/assets/js/game-app.js?v=step6-1"></script>
  </body>
</html>
`;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(sourceDirectory, outputDirectory, { recursive: true });
await mkdir(path.join(outputDirectory, 'data'), { recursive: true });

for (const fileName of contentFiles) {
  await cp(
    path.join(contentDirectory, fileName),
    path.join(outputDirectory, 'data', fileName)
  );
}

const tests = parsedContent.get('tests.json')?.items ?? [];
for (const test of tests.filter((item) => item.status === 'published')) {
  const detailDirectory = path.join(outputDirectory, 'test', test.slug);
  const resultDirectory = path.join(detailDirectory, 'result');
  await mkdir(resultDirectory, { recursive: true });
  await writeFile(
    path.join(detailDirectory, 'index.html'),
    createTestPageHtml(test, 'intro'),
    'utf8'
  );
  await writeFile(
    path.join(resultDirectory, 'index.html'),
    createTestPageHtml(test, 'result'),
    'utf8'
  );
}

const balanceGames = parsedContent.get('balance-games.json')?.items ?? [];
for (const game of balanceGames.filter((item) => item.status === 'published')) {
  const detailDirectory = path.join(outputDirectory, 'vote', game.slug);
  await mkdir(detailDirectory, { recursive: true });
  await writeFile(
    path.join(detailDirectory, 'index.html'),
    createBalancePageHtml(game),
    'utf8'
  );
}

const miniGames = parsedContent.get('mini-games.json')?.items ?? [];
for (const game of miniGames.filter((item) => item.status === 'published')) {
  const detailDirectory = path.join(outputDirectory, 'game', game.slug);
  await mkdir(detailDirectory, { recursive: true });
  await writeFile(
    path.join(detailDirectory, 'index.html'),
    createMiniGamePageHtml(game, miniGames),
    'utf8'
  );
}

if (siteBasePath) {
  const outputEntries = await readdir(outputDirectory, {
    recursive: true,
    withFileTypes: true
  });

  for (const entry of outputEntries) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const htmlPath = path.join(entry.parentPath, entry.name);
    const html = await readFile(htmlPath, 'utf8');
    const prefixedHtml = html.replace(
      /(href|src)="\/(?!\/)/g,
      `$1="${siteBasePath}/`
    );
    await writeFile(htmlPath, prefixedHtml, 'utf8');
  }
}

await writeFile(
  path.join(outputDirectory, 'build-meta.json'),
  `${JSON.stringify({ service: 'DAILY TEST LAB', build: 'step-7-admin-daily-content', siteBasePath }, null, 2)}\n`,
  'utf8'
);

console.log('Build complete: dist/');
