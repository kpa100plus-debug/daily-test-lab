import { calculateTestResult } from './test-engine.js';
import { loadPublishedTests, loadTestBundle } from './content-repository.js';

const buildStep = 'REF-DAILYFUN-STEP8-CONTENT-CRUD-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/test-app\.js$/, '');
const testSlug = document.body.dataset.testSlug;
const initialView = document.body.dataset.testView || 'intro';
const app = document.querySelector('#test-app');

document.documentElement.dataset.buildStep = buildStep;

const state = {
  test: null,
  allTests: [],
  questionIndex: 0,
  answers: []
};

const toSiteUrl = (route) => `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;

const safeStorage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장이 차단된 환경에서도 테스트 자체는 계속 진행합니다.
    }
  }
};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function replaceApp(screen) {
  app?.replaceChildren(screen);
  app?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderIntro() {
  const test = state.test;
  const screen = createElement('div', 'test-intro');
  screen.dataset.screen = 'intro';

  const icon = createElement('span', 'test-main-icon', test.icon || '✨');
  icon.setAttribute('aria-hidden', 'true');

  const meta = createElement('div', 'test-meta-row');
  [test.category, test.duration, `${test.questionCount}문항`].forEach((value) => {
    meta.append(createElement('span', '', value));
  });

  const kicker = createElement('p', 'section-kicker', 'DAILY PERSONALITY TEST');
  const title = createElement('h1', '', test.title);
  const lead = createElement('p', 'test-lead', test.description);
  const start = createElement('button', 'test-start-button', '테스트 시작하기');
  start.type = 'button';
  start.addEventListener('click', () => {
    state.questionIndex = 0;
    state.answers = [];
    renderQuestion();
  });
  const disclaimer = createElement('p', 'test-disclaimer', test.disclaimer);

  screen.append(icon, meta, kicker, title, lead, start, disclaimer);
  replaceApp(screen);
}

function chooseAnswer(option, button) {
  state.answers[state.questionIndex] = option;
  document.querySelectorAll('.answer-button').forEach((item) => {
    item.disabled = true;
    item.classList.toggle('selected', item === button);
  });

  window.setTimeout(() => {
    if (state.questionIndex < state.test.questions.length - 1) {
      state.questionIndex += 1;
      renderQuestion();
      return;
    }
    completeTest();
  }, 180);
}

function renderQuestion() {
  const test = state.test;
  const question = test.questions[state.questionIndex];
  const currentNumber = state.questionIndex + 1;
  const progress = Math.round((currentNumber / test.questions.length) * 100);
  const screen = createElement('div', 'test-question-screen');
  screen.dataset.screen = 'question';

  const progressTop = createElement('div', 'question-progress-top');
  progressTop.append(
    createElement('span', '', `QUESTION ${String(currentNumber).padStart(2, '0')}`),
    createElement('strong', '', `${currentNumber} / ${test.questions.length}`)
  );

  const progressTrack = createElement('div', 'question-progress-track');
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-valuemin', '1');
  progressTrack.setAttribute('aria-valuemax', String(test.questions.length));
  progressTrack.setAttribute('aria-valuenow', String(currentNumber));
  progressTrack.setAttribute('aria-label', `질문 ${currentNumber}/${test.questions.length}`);
  const progressBar = createElement('span', 'question-progress-bar');
  progressBar.style.width = `${progress}%`;
  progressTrack.append(progressBar);

  const title = createElement('h1', 'question-title', question.text);
  const options = createElement('div', 'answer-list');
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  question.options.forEach((option, index) => {
    const button = createElement('button', 'answer-button');
    button.type = 'button';
    const letter = createElement('span', 'answer-letter', optionLetters[index] || String(index + 1));
    const text = createElement('span', 'answer-text', option.text);
    button.append(letter, text);
    button.addEventListener('click', () => chooseAnswer(option, button));
    options.append(button);
  });

  const footer = createElement('div', 'question-footer');
  if (state.questionIndex > 0) {
    const back = createElement('button', 'question-back', '← 이전 질문');
    back.type = 'button';
    back.addEventListener('click', () => {
      state.questionIndex -= 1;
      renderQuestion();
    });
    footer.append(back);
  } else {
    footer.append(createElement('span', 'question-hint', '가장 마음에 가까운 답을 골라주세요'));
  }

  screen.append(progressTop, progressTrack, title, options, footer);
  replaceApp(screen);
}

function saveResult(result) {
  const history = safeStorage.get('daily-test-lab.test-results.v1', {});
  history[state.test.slug] = {
    testTitle: state.test.title,
    resultId: result.id,
    resultTitle: result.title,
    emoji: result.emoji,
    completedAt: new Date().toISOString()
  };
  safeStorage.set('daily-test-lab.test-results.v1', history);
}

function completeTest() {
  const result = calculateTestResult(state.test, state.answers);
  saveResult(result);
  const resultUrl = toSiteUrl(`/test/${state.test.slug}/result/?type=${encodeURIComponent(result.id)}`);
  location.assign(resultUrl);
}

async function shareResult(result, status) {
  const shareUrl = new URL(
    toSiteUrl(`/test/${state.test.slug}/result/?type=${encodeURIComponent(result.id)}`),
    location.origin
  ).href;
  const shareData = {
    title: `${state.test.shortTitle} · ${result.title}`,
    text: result.shareText,
    url: shareUrl
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      status.textContent = '공유 완료';
    } else {
      await navigator.clipboard.writeText(shareUrl);
      status.textContent = '결과 주소 복사됨';
    }
    const shareCountKey = 'daily-test-lab.share-count.v1';
    const shareCount = Number(safeStorage.get(shareCountKey, 0)) || 0;
    safeStorage.set(shareCountKey, shareCount + 1);
  } catch (error) {
    if (error?.name !== 'AbortError') status.textContent = '공유를 다시 시도해 주세요';
  }
}

function renderResult(result) {
  const screen = createElement('div', 'test-result-screen');
  screen.dataset.screen = 'result';

  const resultTop = createElement('div', 'result-hero');
  const kicker = createElement('p', 'result-kicker', 'MY TEST RESULT');
  const emoji = createElement('span', 'result-emoji', result.emoji);
  emoji.setAttribute('aria-hidden', 'true');
  const label = createElement('span', 'result-label', result.label);
  const title = createElement('h1', '', result.title);
  const summary = createElement('p', 'result-summary', result.summary);
  resultTop.append(kicker, emoji, label, title, summary);

  const detail = createElement('div', 'result-detail');
  detail.append(createElement('p', 'result-description', result.description));

  const traitsTitle = createElement('h2', '', '나를 설명하는 3가지');
  const traits = createElement('div', 'result-traits');
  result.traits.forEach((trait) => traits.append(createElement('span', '', trait)));

  const tipsTitle = createElement('h2', '', '나를 더 잘 활용하는 팁');
  const tips = createElement('ul', 'result-tips');
  result.tips.forEach((tip) => tips.append(createElement('li', '', tip)));

  const actions = createElement('div', 'result-actions');
  const share = createElement('button', 'result-share-button', '결과 공유하기');
  share.type = 'button';
  const retry = createElement('a', 'result-retry-button', '다시 테스트');
  retry.href = toSiteUrl(`/test/${state.test.slug}/`);
  const shareStatus = createElement('p', 'share-status');
  shareStatus.setAttribute('aria-live', 'polite');
  share.addEventListener('click', () => shareResult(result, shareStatus));
  actions.append(share, retry);

  const disclaimer = createElement('p', 'test-disclaimer', state.test.disclaimer);
  detail.append(traitsTitle, traits, tipsTitle, tips, actions, shareStatus, disclaimer);
  screen.append(resultTop, detail);
  replaceApp(screen);
  document.title = `${result.title} · ${state.test.shortTitle} | DAILY TEST LAB`;
}

function renderMissingResult() {
  const screen = createElement('div', 'test-empty-state');
  screen.append(
    createElement('span', 'test-loading-icon', '🧭'),
    createElement('h1', '', '결과를 찾을 수 없어요'),
    createElement('p', '', '테스트를 다시 완료하면 정확한 결과를 확인할 수 있어요.')
  );
  const retry = createElement('a', 'test-start-button', '테스트 시작하기');
  retry.href = toSiteUrl(`/test/${testSlug}/`);
  screen.append(retry);
  replaceApp(screen);
}

function createRecommendationCard(test) {
  const link = createElement('a', 'test-catalog-card');
  link.dataset.accent = test.accent || 'violet';
  link.href = toSiteUrl(`/test/${test.slug}/`);
  const icon = createElement('span', 'test-card-icon', test.icon || '✨');
  icon.setAttribute('aria-hidden', 'true');
  const category = createElement('span', 'test-card-category', test.category);
  const top = createElement('div', 'test-card-top');
  top.append(icon, category);
  link.append(
    top,
    createElement('h3', '', test.title),
    createElement('p', '', test.description),
    createElement('strong', 'recommend-action', `${test.duration} · 시작 →`)
  );
  return link;
}

function renderRecommendations() {
  const container = document.querySelector('#recommended-tests');
  if (!container || !state.test) return;
  const preferred = state.test.recommendations || [];
  const candidates = preferred
    .map((slug) => state.allTests.find((test) => test.slug === slug))
    .filter(Boolean);
  const recommendations = (candidates.length ? candidates : state.allTests)
    .filter((test) => test.slug !== state.test.slug)
    .slice(0, 2);
  container.replaceChildren(...recommendations.map(createRecommendationCard));
}

function renderLoadError() {
  const screen = createElement('div', 'test-empty-state');
  screen.append(
    createElement('span', 'test-loading-icon', '😵'),
    createElement('h1', '', '테스트를 불러오지 못했어요'),
    createElement('p', '', '잠시 후 다시 시도해 주세요.')
  );
  const listLink = createElement('a', 'test-start-button', '테스트 목록으로');
  listLink.href = toSiteUrl('/test/');
  screen.append(listLink);
  replaceApp(screen);
}

async function loadTest() {
  try {
    [state.allTests, state.test] = await Promise.all([
      loadPublishedTests(),
      loadTestBundle(testSlug)
    ]);
    if (!state.test) throw new Error('test not found');
    renderRecommendations();

    if (initialView === 'result') {
      const savedResult = safeStorage.get('daily-test-lab.test-results.v1', {})[testSlug];
      const resultId = new URLSearchParams(location.search).get('type') || savedResult?.resultId;
      const result = state.test.results.find((item) => item.id === resultId);
      if (result) renderResult(result);
      else renderMissingResult();
      return;
    }

    renderIntro();
  } catch (error) {
    console.warn('심리테스트 로드 오류:', error.message);
    renderLoadError();
  }
}

loadTest();
