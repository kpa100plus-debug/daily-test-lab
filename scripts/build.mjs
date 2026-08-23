import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createBalanceSlotSlugs,
  createBlankBalanceGame,
  createBlankTest,
  createTestSlotSlugs
} from '../src/site/assets/js/content-admin-engine.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceDirectory = path.join(projectRoot, 'src', 'site');
const contentDirectory = path.join(projectRoot, 'src', 'content');
const outputDirectory = path.join(projectRoot, 'dist');
const siteBasePath = (process.env.SITE_BASE_PATH ?? '').replace(/\/$/, '');
const publicSiteUrl = (process.env.PUBLIC_SITE_URL ?? 'https://kpa100plus-debug.github.io/daily-test-lab')
  .replace(/\/$/, '');
const releaseDate = '2026-08-23';

const googleSiteVerification = /^[A-Za-z0-9_-]{8,}$/.test(process.env.GOOGLE_SITE_VERIFICATION ?? '')
  ? process.env.GOOGLE_SITE_VERIFICATION
  : '';
const googleAnalyticsId = /^G-[A-Z0-9]+$/.test(process.env.GOOGLE_ANALYTICS_ID ?? '')
  ? process.env.GOOGLE_ANALYTICS_ID
  : '';
const adsenseClientId = /^ca-pub-[0-9]+$/.test(process.env.ADSENSE_CLIENT_ID ?? '')
  ? process.env.ADSENSE_CLIENT_ID
  : '';
const adsensePublisherId = /^pub-[0-9]+$/.test(process.env.ADSENSE_PUBLISHER_ID ?? '')
  ? process.env.ADSENSE_PUBLISHER_ID
  : adsenseClientId.replace(/^ca-/, '');

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

const escapeXml = (value) => escapeHtml(value);
const toPublicUrl = (route = '/') => `${publicSiteUrl}${route.startsWith('/') ? route : `/${route}`}`;
const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const publisherSchema = {
  '@type': 'Organization',
  '@id': `${publicSiteUrl}/#organization`,
  name: '㈜ISEA GROUP',
  alternateName: 'ISEA GROUP',
  url: `${publicSiteUrl}/`
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${publicSiteUrl}/#website`,
  url: `${publicSiteUrl}/`,
  name: 'DAILY TEST LAB',
  description: '매일 무료로 즐기는 심리테스트, 밸런스게임, 미니게임 플랫폼',
  inLanguage: 'ko-KR',
  publisher: { '@id': publisherSchema['@id'] }
};

function createBreadcrumbSchema(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toPublicUrl(item.route)
    }))
  };
}

function createPageSchema({ type = 'WebPage', route, title, description }) {
  const url = toPublicUrl(route);
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': websiteSchema['@id'] },
    publisher: { '@id': publisherSchema['@id'] }
  };
}

function createIntegrationTags() {
  const tags = [];
  if (googleSiteVerification) {
    tags.push(`<meta name="google-site-verification" content="${escapeHtml(googleSiteVerification)}">`);
  }
  if (googleAnalyticsId) {
    tags.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(googleAnalyticsId)}"></script>`);
    tags.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${escapeHtml(googleAnalyticsId)}',{'anonymize_ip':true});</script>`);
  }
  if (adsenseClientId) {
    tags.push(`<script async crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtml(adsenseClientId)}"></script>`);
  }
  return tags.join('\n    ');
}

function createSeoHead({ route, title, description, indexable = true, schemas = [] }) {
  const canonicalUrl = toPublicUrl(route);
  const robots = indexable
    ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'noindex,nofollow';
  const tags = [
    `<meta name="robots" content="${robots}">`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<title>${escapeHtml(title)}</title>`
  ];

  if (indexable) {
    tags.push(
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:site_name" content="DAILY TEST LAB">`,
      `<meta property="og:locale" content="ko_KR">`,
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
      `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
      '<meta name="twitter:card" content="summary">',
      `<meta name="twitter:title" content="${escapeHtml(title)}">`,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`
    );
    const integrationTags = createIntegrationTags();
    if (integrationTags) tags.push(integrationTags);
    if (schemas.length) {
      tags.push(`<script type="application/ld+json">${safeJson({ '@context': 'https://schema.org', '@graph': schemas })}</script>`);
    }
  }

  return tags.join('\n    ');
}

function replaceSeoHead(html, configuration) {
  const cleaned = html
    .replace(/\s*<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="google-site-verification"[^>]*>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '');
  return cleaned.replace('</head>', `    ${createSeoHead(configuration)}\n  </head>`);
}

function createTestPageHtml(test, view) {
  const isResultPage = view === 'result';
  const indexable = test.status === 'published' && !isResultPage;
  const route = isResultPage ? `/test/${test.slug}/result/` : `/test/${test.slug}/`;
  const title = isResultPage
    ? `${test.shortTitle} 결과 | DAILY TEST LAB`
    : test.seo.title;
  const description = isResultPage
    ? `${test.title} 결과를 확인하고 친구와 공유해 보세요.`
    : test.seo.description;
  const schemas = indexable ? [
    publisherSchema,
    websiteSchema,
    createPageSchema({ route, title, description }),
    createBreadcrumbSchema([
      { name: '홈', route: '/' },
      { name: '심리테스트', route: '/test/' },
      { name: test.shortTitle, route }
    ])
  ] : [];
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
    ${createSeoHead({ route, title, description, indexable, schemas })}
    <link rel="stylesheet" href="/assets/css/app.css?v=step8-1">
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

      ${!isResultPage ? `<section class="test-list-note" aria-labelledby="test-guide-${escapeHtml(test.slug)}">
        <span aria-hidden="true">🔎</span>
        <div><h2 id="test-guide-${escapeHtml(test.slug)}">${escapeHtml(test.shortTitle)} 테스트 안내</h2><p>${escapeHtml(test.description)} 총 ${test.questionCount}개 질문에 답하면 나와 가까운 유형과 생활 속 활용 팁을 확인할 수 있습니다. 결과는 재미와 자기이해를 위한 참고 콘텐츠입니다.</p></div>
      </section>` : ''}

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
    <script type="module" src="/assets/js/test-app.js?v=step8-2"></script>
  </body>
</html>
`;
}

function createBalancePageHtml(game) {
  const firstOption = game.options[0];
  const secondOption = game.options[1];
  const pageTitle = /\|\s*DAILY TEST LAB$/i.test(game.seo.title)
    ? game.seo.title
    : `${game.seo.title} | DAILY TEST LAB`;
  const route = `/vote/${game.slug}/`;
  const indexable = game.status === 'published';
  const schemas = indexable ? [
    publisherSchema,
    websiteSchema,
    createPageSchema({ route, title: pageTitle, description: game.seo.description }),
    createBreadcrumbSchema([
      { name: '홈', route: '/' },
      { name: '밸런스게임', route: '/vote/' },
      { name: game.title, route }
    ])
  ] : [];

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#ff5f8f">
    ${createSeoHead({ route, title: pageTitle, description: game.seo.description, indexable, schemas })}
    <link rel="stylesheet" href="/assets/css/app.css?v=step8-1">
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

      ${indexable ? `<section class="balance-list-note" aria-labelledby="balance-guide-${escapeHtml(game.slug)}">
        <span aria-hidden="true">⚖️</span>
        <div><h2 id="balance-guide-${escapeHtml(game.slug)}">정답 없는 오늘의 선택</h2><p>${escapeHtml(game.description)} ${escapeHtml(firstOption.shortLabel)}와 ${escapeHtml(secondOption.shortLabel)} 중 마음이 가는 쪽을 고르면 참여 비율을 바로 확인할 수 있습니다.</p></div>
      </section>` : ''}

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
    <script type="module" src="/assets/js/balance-app.js?v=step8-2"></script>
  </body>
</html>
`;
}

function createMiniGamePageHtml(game, allGames) {
  const pageTitle = /\|\s*DAILY TEST LAB$/i.test(game.seo.title)
    ? game.seo.title
    : `${game.seo.title} | DAILY TEST LAB`;
  const route = `/game/${game.slug}/`;
  const indexable = game.status === 'published';
  const schemas = indexable ? [
    publisherSchema,
    websiteSchema,
    createPageSchema({ route, title: pageTitle, description: game.seo.description }),
    createBreadcrumbSchema([
      { name: '홈', route: '/' },
      { name: '10초 게임', route: '/game/' },
      { name: game.shortTitle, route }
    ])
  ] : [];
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
    ${createSeoHead({ route, title: pageTitle, description: game.seo.description, indexable, schemas })}
    <link rel="stylesheet" href="/assets/css/app.css?v=step8-1">
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

      <section class="mini-game-list-note" aria-labelledby="game-guide-${escapeHtml(game.slug)}">
        <span aria-hidden="true">🏁</span>
        <div><h2 id="game-guide-${escapeHtml(game.slug)}">${escapeHtml(game.shortTitle)} 기록 도전 방법</h2><p>${escapeHtml(game.instruction)} 설치 없이 무료로 플레이할 수 있고, 최고 기록은 현재 브라우저와 로그인 계정에 이어서 저장할 수 있습니다.</p></div>
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
const balanceGames = parsedContent.get('balance-games.json')?.items ?? [];
const miniGames = parsedContent.get('mini-games.json')?.items ?? [];
const publishedTests = tests.filter((item) => item.status === 'published');
const publishedBalanceGames = balanceGames.filter((item) => item.status === 'published');
const publishedMiniGames = miniGames.filter((item) => item.status === 'published');

function replaceCatalogContents(html, elementId, content) {
  const pattern = new RegExp(`(<div\\b[^>]*\\bid="${elementId}"[^>]*>)[\\s\\S]*?(\\n\\s*</div>\\n\\s*</section>)`);
  if (!pattern.test(html)) throw new Error(`Catalog container is missing: ${elementId}`);
  return html.replace(pattern, `$1\n${content}$2`);
}

const testCards = publishedTests.map((test) => `          <a class="test-catalog-card" data-accent="${escapeHtml(test.accent)}" href="/test/${escapeHtml(test.slug)}/">
            <div class="test-card-top"><span class="test-card-icon" aria-hidden="true">${escapeHtml(test.icon)}</span><span class="test-card-category">${escapeHtml(test.category)}</span></div>
            <h3>${escapeHtml(test.title)}</h3><p>${escapeHtml(test.description)}</p>
            <div class="test-card-bottom"><span>${escapeHtml(test.duration)} · ${test.questionCount}문항</span><strong>시작 →</strong></div>
          </a>`).join('\n');
const balanceCards = publishedBalanceGames.map((game) => `          <a class="balance-catalog-card" href="/vote/${escapeHtml(game.slug)}/">
            <div class="balance-card-top"><span class="balance-card-icon" aria-hidden="true">${escapeHtml(game.icon)}</span><span class="balance-card-category">${escapeHtml(game.category)}</span></div>
            <h3>${escapeHtml(game.question)}</h3><div class="balance-card-options"><span>${escapeHtml(game.options[0].shortLabel)}</span><b>VS</b><span>${escapeHtml(game.options[1].shortLabel)}</span></div><small class="balance-card-action">10초 선택 →</small>
          </a>`).join('\n');
const miniGameCards = publishedMiniGames.map((game) => `          <a class="mini-game-card" data-accent="${escapeHtml(game.accent)}" href="/game/${escapeHtml(game.slug)}/">
            <div class="mini-game-card-top"><span class="mini-game-card-icon" aria-hidden="true">${escapeHtml(game.icon)}</span><span class="mini-game-card-duration">${escapeHtml(game.duration)}</span></div>
            <span class="mini-game-card-category">${escapeHtml(game.category)}</span><h2>${escapeHtml(game.title)}</h2><p>${escapeHtml(game.description)}</p>
            <div class="mini-game-card-record"><span>${escapeHtml(game.recordLabel)}</span><strong>첫 기록 도전</strong></div><span class="mini-game-card-action">지금 플레이 →</span>
          </a>`).join('\n');

for (const [relativePath, elementId, cards, statusPattern, statusText] of [
  ['test/index.html', 'test-grid', testCards, /(<span class="catalog-status" id="catalog-status"[^>]*>)[^<]*(<\/span>)/, `${publishedTests.length}개 테스트`],
  ['vote/index.html', 'balance-catalog-grid', balanceCards, /(<span class="catalog-status" id="balance-catalog-status"[^>]*>)[^<]*(<\/span>)/, `${publishedBalanceGames.length}개 질문`],
  ['game/index.html', 'mini-game-catalog', miniGameCards, null, '']
]) {
  const filePath = path.join(outputDirectory, relativePath);
  let html = await readFile(filePath, 'utf8');
  html = replaceCatalogContents(html, elementId, cards);
  if (statusPattern) html = html.replace(statusPattern, `$1${statusText}$2`);
  await writeFile(filePath, html, 'utf8');
}

const staticSeoPages = [
  {
    path: 'index.html', route: '/', title: 'DAILY TEST LAB | 매일 즐기는 무료 테스트·게임',
    description: '심리테스트, 밸런스게임, 반응속도·기억력 미니게임을 설치 없이 매일 무료로 즐기고 결과와 기록을 공유하세요.',
    schemas: [publisherSchema, websiteSchema, createPageSchema({ route: '/', title: 'DAILY TEST LAB | 매일 즐기는 무료 테스트·게임', description: '심리테스트, 밸런스게임, 반응속도·기억력 미니게임을 설치 없이 매일 무료로 즐기고 결과와 기록을 공유하세요.' })]
  },
  {
    path: 'test/index.html', route: '/test/', title: '무료 심리테스트 모음 | DAILY TEST LAB',
    description: '성격, 관계, 업무 성향을 재미있게 알아보는 무료 심리테스트를 골라 바로 결과를 확인하세요.', type: 'CollectionPage', breadcrumbName: '심리테스트'
  },
  {
    path: 'vote/index.html', route: '/vote/', title: '무료 밸런스게임 모음 | DAILY TEST LAB',
    description: '둘 중 하나를 고르고 다른 사람들의 선택 비율을 확인하는 무료 밸런스게임 20개를 즐겨보세요.', type: 'CollectionPage', breadcrumbName: '밸런스게임'
  },
  {
    path: 'game/index.html', route: '/game/', title: '무료 미니게임 3종 | DAILY TEST LAB',
    description: '반응속도, 기억력, 숫자 순서 게임을 설치 없이 무료로 플레이하고 오늘의 최고 기록에 도전하세요.', type: 'CollectionPage', breadcrumbName: '10초 게임'
  },
  {
    path: 'legal/privacy/index.html', route: '/legal/privacy/', title: '개인정보처리방침 | DAILY TEST LAB',
    description: '㈜ISEA GROUP이 운영하는 DAILY TEST LAB의 개인정보 수집, 이용, 보관, 파기 및 이용자 권리 안내입니다.', breadcrumbName: '개인정보처리방침'
  },
  {
    path: 'legal/terms/index.html', route: '/legal/terms/', title: '이용약관 | DAILY TEST LAB',
    description: 'DAILY TEST LAB 무료 테스트·게임 서비스의 이용 조건, 금지행위, 지식재산권 및 광고 운영 기준입니다.', breadcrumbName: '이용약관'
  },
  {
    path: 'legal/ads/index.html', route: '/legal/ads/', title: '광고 안내 | DAILY TEST LAB',
    description: '콘텐츠와 광고를 명확히 구분하고 클릭 유도·보상·오클릭 배치를 금지하는 DAILY TEST LAB 광고 운영 원칙입니다.', breadcrumbName: '광고 안내'
  },
  {
    path: 'contact/index.html', route: '/contact/', title: '문의 | DAILY TEST LAB',
    description: 'DAILY TEST LAB 서비스 운영, 개인정보, 광고와 제휴 관련 문의 방법 및 ㈜ISEA GROUP 운영 정보입니다.', breadcrumbName: '문의'
  }
];

for (const configuration of staticSeoPages) {
  const filePath = path.join(outputDirectory, configuration.path);
  const schemas = configuration.schemas ?? [
    publisherSchema,
    websiteSchema,
    createPageSchema({
      type: configuration.type,
      route: configuration.route,
      title: configuration.title,
      description: configuration.description
    }),
    createBreadcrumbSchema([
      { name: '홈', route: '/' },
      { name: configuration.breadcrumbName, route: configuration.route }
    ])
  ];
  const html = await readFile(filePath, 'utf8');
  await writeFile(filePath, replaceSeoHead(html, { ...configuration, schemas }), 'utf8');
}

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

// GitHub Pages는 런타임에 새 경로를 만들 수 없으므로 무료 관리자 슬롯의
// 물리 페이지를 미리 생성한다. 실제 콘텐츠는 Firebase에서 교체된다.
for (const slotSlug of createTestSlotSlugs()) {
  const test = createBlankTest(slotSlug);
  const detailDirectory = path.join(outputDirectory, 'test', test.slug);
  const resultDirectory = path.join(detailDirectory, 'result');
  await mkdir(resultDirectory, { recursive: true });
  await writeFile(path.join(detailDirectory, 'index.html'), createTestPageHtml(test, 'intro'), 'utf8');
  await writeFile(path.join(resultDirectory, 'index.html'), createTestPageHtml(test, 'result'), 'utf8');
}

for (const game of balanceGames.filter((item) => item.status === 'published')) {
  const detailDirectory = path.join(outputDirectory, 'vote', game.slug);
  await mkdir(detailDirectory, { recursive: true });
  await writeFile(
    path.join(detailDirectory, 'index.html'),
    createBalancePageHtml(game),
    'utf8'
  );
}

for (const slotSlug of createBalanceSlotSlugs()) {
  const game = createBlankBalanceGame(slotSlug);
  const detailDirectory = path.join(outputDirectory, 'vote', game.slug);
  await mkdir(detailDirectory, { recursive: true });
  await writeFile(path.join(detailDirectory, 'index.html'), createBalancePageHtml(game), 'utf8');
}

for (const game of miniGames.filter((item) => item.status === 'published')) {
  const detailDirectory = path.join(outputDirectory, 'game', game.slug);
  await mkdir(detailDirectory, { recursive: true });
  await writeFile(
    path.join(detailDirectory, 'index.html'),
    createMiniGamePageHtml(game, miniGames),
    'utf8'
  );
}

const indexableRoutes = [
  ...staticSeoPages.map((page) => page.route),
  ...publishedTests.map((test) => `/test/${test.slug}/`),
  ...publishedBalanceGames.map((game) => `/vote/${game.slug}/`),
  ...publishedMiniGames.map((game) => `/game/${game.slug}/`)
];
const sitemapEntries = indexableRoutes
  .map((route) => `  <url><loc>${escapeXml(toPublicUrl(route))}</loc><lastmod>${releaseDate}</lastmod></url>`)
  .join('\n');
await writeFile(
  path.join(outputDirectory, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
  'utf8'
);

const publicPath = new URL(publicSiteUrl).pathname.replace(/\/$/, '') || '/';
await writeFile(
  path.join(outputDirectory, 'robots.txt'),
  `User-agent: *\nAllow: ${publicPath === '/' ? '/' : `${publicPath}/`}\n\nSitemap: ${toPublicUrl('/sitemap.xml')}\n`,
  'utf8'
);

if (adsensePublisherId) {
  await writeFile(
    path.join(outputDirectory, 'ads.txt'),
    `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`,
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
  `${JSON.stringify({
    service: 'DAILY TEST LAB',
    build: 'step-9-seo-adsense',
    siteBasePath,
    publicSiteUrl,
    indexableUrlCount: indexableRoutes.length,
    integrations: {
      googleSiteVerification: Boolean(googleSiteVerification),
      googleAnalytics: Boolean(googleAnalyticsId),
      adsense: Boolean(adsenseClientId),
      adsTxt: Boolean(adsensePublisherId)
    }
  }, null, 2)}\n`,
  'utf8'
);

console.log('Build complete: dist/');
