import { shareOrCopy } from './share-service.js';
import { getFirebaseServices } from './firebase-client.js';
import { loadPublishedBalanceGames } from './content-repository.js';
import {
  applyVote,
  calculateVotePercentages,
  normalizeVoteStats,
  selectDailyGame
} from './balance-engine.js';

const buildStep = 'REF-DAILYFUN-STEP8-CONTENT-CRUD-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/balance-app\.js$/, '');
const requestedSlug = document.body.dataset.balanceSlug || '';
const pageType = document.body.dataset.balancePage || 'detail';
const app = document.querySelector('#balance-app');
const koreaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const todayKey = koreaDateFormatter.format(new Date());
const numberFormatter = new Intl.NumberFormat('ko-KR');

document.documentElement.dataset.buildStep = buildStep;

const state = {
  game: null,
  games: [],
  category: 'all',
  voting: false
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
      // 저장이 제한된 환경에서도 현재 투표 화면은 계속 동작합니다.
    }
  }
};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getStoredChoices() {
  return safeStorage.get('daily-test-lab.balance-choices.v1', {});
}

function getLocalStats() {
  return safeStorage.get('daily-test-lab.balance-local-stats.v1', {});
}

function saveLocalVote(slug, choice) {
  const choices = getStoredChoices();
  const allStats = getLocalStats();
  const existingChoice = choices[slug];

  if (!existingChoice) {
    allStats[slug] = applyVote(allStats[slug], choice);
    choices[slug] = choice;
    safeStorage.set('daily-test-lab.balance-choices.v1', choices);
    safeStorage.set('daily-test-lab.balance-local-stats.v1', allStats);

    const playCountKey = 'daily-test-lab.play-count.v1';
    const playCount = Number(safeStorage.get(playCountKey, 0)) || 0;
    safeStorage.set(playCountKey, playCount + 1);
  }

  return {
    choice: existingChoice || choice,
    stats: normalizeVoteStats(allStats[slug])
  };
}

function cacheRemoteVote(slug, choice, stats) {
  const choices = getStoredChoices();
  const allStats = getLocalStats();
  choices[slug] = choice;
  allStats[slug] = normalizeVoteStats(stats);
  safeStorage.set('daily-test-lab.balance-choices.v1', choices);
  safeStorage.set('daily-test-lab.balance-local-stats.v1', allStats);
}

async function ensureAnonymousUser(services) {
  if (services.auth.currentUser) return services.auth.currentUser;
  const credential = await services.authSdk.signInAnonymously(services.auth);
  return credential.user;
}

async function submitRemoteVote(game, preferredChoice) {
  const services = await getFirebaseServices();
  const user = await ensureAnonymousUser(services);
  const { doc, runTransaction, serverTimestamp } = services.firestoreSdk;
  const statsReference = doc(services.db, 'balance_games', game.slug);
  const voteReference = doc(services.db, 'votes', `${game.slug}_${user.uid}`);

  return runTransaction(services.db, async (transaction) => {
    const voteSnapshot = await transaction.get(voteReference);
    const statsSnapshot = await transaction.get(statsReference);
    const currentStats = normalizeVoteStats(statsSnapshot.exists() ? statsSnapshot.data() : {});

    if (voteSnapshot.exists()) {
      return {
        choice: voteSnapshot.data().choice,
        stats: currentStats,
        source: 'remote'
      };
    }

    const nextStats = applyVote(currentStats, preferredChoice);
    transaction.set(statsReference, {
      gameId: game.slug,
      a: nextStats.a,
      b: nextStats.b,
      total: nextStats.total,
      updatedAt: serverTimestamp()
    });
    transaction.set(voteReference, {
      gameId: game.slug,
      userId: user.uid,
      choice: preferredChoice,
      createdAt: serverTimestamp()
    });

    return { choice: preferredChoice, stats: nextStats, source: 'remote' };
  });
}

function getNextGame() {
  const currentIndex = state.games.findIndex((game) => game.slug === state.game?.slug);
  return state.games[(currentIndex + 1 + state.games.length) % state.games.length];
}

function getResultMessage(choice, percentages) {
  const chosenPercent = percentages[choice];
  if (Math.abs(percentages.a - percentages.b) <= 4) {
    return '취향이 거의 정확히 반으로 갈렸어요!';
  }
  if (chosenPercent >= 50) {
    return `당신은 ${chosenPercent}%가 고른 다수의 선택과 같아요.`;
  }
  return `당신은 ${chosenPercent}%의 소수 취향을 골랐어요.`;
}

async function shareGame(game, choice, status) {
  const option = game.options.find((item) => item.id === choice);
  const shareUrl = new URL(toSiteUrl(`/vote/${game.slug}/`), location.origin).href;
  const shareData = {
    title: `${game.title} | DAILY TEST LAB`,
    text: option ? `${game.shareText} 나는 “${option.shortLabel}” 선택!` : game.shareText,
    url: shareUrl
  };
  const outcome = await shareOrCopy(shareData);
  if (outcome.method === 'shared') status.textContent = '친구에게 공유했어요.';
  if (outcome.method === 'copied') status.textContent = '선택과 링크를 복사했어요.';
  if (outcome.method === 'cancelled') status.textContent = '공유를 취소했어요.';
  if (outcome.method === 'manual') status.textContent = '공유 내용을 직접 복사해 주세요.';

  if (outcome.ok) {
    const shareCountKey = 'daily-test-lab.share-count.v1';
    const shareCount = Number(safeStorage.get(shareCountKey, 0)) || 0;
    safeStorage.set(shareCountKey, shareCount + 1);
  }
}

function renderQuestion(game) {
  const screen = createElement('div', 'balance-question-screen');
  screen.dataset.screen = 'question';

  const top = createElement('div', 'balance-question-top');
  top.append(
    createElement('span', 'balance-category', game.category),
    createElement('span', 'balance-once', '질문별 1회 선택')
  );
  const icon = createElement('span', 'balance-main-icon', game.icon || '⚖️');
  icon.setAttribute('aria-hidden', 'true');
  const kicker = createElement('p', 'section-kicker', pageType === 'list' ? 'TODAY BALANCE' : 'BALANCE GAME');
  const title = createElement('h1', '', game.question);
  const description = createElement('p', 'balance-description', game.description);
  const versus = createElement('div', 'balance-choices');

  game.options.forEach((option, index) => {
    const button = createElement('button', `balance-choice balance-choice-${option.id}`);
    button.type = 'button';
    button.dataset.choice = option.id;
    button.setAttribute('aria-label', `${option.label} 선택`);
    button.append(
      createElement('span', 'balance-choice-emoji', option.emoji),
      createElement('strong', '', option.label),
      createElement('small', '', '이것을 선택')
    );
    button.addEventListener('click', () => handleVote(option.id));
    versus.append(button);
    if (index === 0) versus.append(createElement('span', 'balance-vs', 'VS'));
  });

  const status = createElement('p', 'balance-vote-status', '선택하면 바로 결과 비율을 볼 수 있어요.');
  status.setAttribute('aria-live', 'polite');
  screen.append(top, icon, kicker, title, description, versus, status);
  app?.replaceChildren(screen);
}

function renderResult(game, choice, stats, source = 'local') {
  const normalizedStats = normalizeVoteStats(stats);
  const percentages = calculateVotePercentages(normalizedStats);
  const chosenOption = game.options.find((item) => item.id === choice) || game.options[0];
  const screen = createElement('div', 'balance-result-screen');
  screen.dataset.screen = 'result';

  const hero = createElement('div', `balance-result-hero chosen-${choice}`);
  hero.append(
    createElement('p', 'balance-result-kicker', 'MY BALANCE PICK'),
    createElement('span', 'balance-result-emoji', chosenOption.emoji),
    createElement('span', 'balance-result-label', '나의 선택'),
    createElement('h1', '', chosenOption.label),
    createElement('p', 'balance-result-message', getResultMessage(choice, percentages))
  );

  const detail = createElement('div', 'balance-result-detail');
  const resultTop = createElement('div', 'balance-result-topline');
  resultTop.append(
    createElement('h2', '', '선택 결과'),
    createElement('strong', '', `${numberFormatter.format(normalizedStats.total)}명 참여`)
  );
  const bars = createElement('div', 'balance-result-bars');

  game.options.forEach((option) => {
    const percentage = percentages[option.id];
    const count = normalizedStats[option.id];
    const row = createElement('div', `balance-result-row result-${option.id}`);
    if (option.id === choice) row.classList.add('my-choice');
    const labels = createElement('div', 'balance-result-row-labels');
    const name = createElement('span', '', `${option.emoji} ${option.shortLabel}`);
    const figure = createElement('strong', '', `${percentage}%`);
    labels.append(name, figure);
    const track = createElement('div', 'balance-result-track');
    const fill = createElement('span', 'balance-result-fill');
    fill.style.width = `${percentage}%`;
    track.append(fill);
    const countLabel = createElement('small', '', `${numberFormatter.format(count)}표${option.id === choice ? ' · 나의 선택' : ''}`);
    row.append(labels, track, countLabel);
    bars.append(row);
  });

  const sourceNote = createElement(
    'p',
    `balance-source-note ${source === 'remote' ? 'is-live' : ''}`,
    source === 'remote'
      ? '● 전체 참여 결과를 실시간으로 집계했어요.'
      : '이 기기 기준 임시 집계입니다. 전체 실시간 집계 연결 전에도 선택 기록은 안전하게 유지됩니다.'
  );

  const actions = createElement('div', 'balance-result-actions');
  const share = createElement('button', 'balance-share-button', '친구에게 공유');
  share.type = 'button';
  const next = createElement('a', 'balance-next-button', '다음 질문 →');
  next.href = toSiteUrl(`/vote/${getNextGame().slug}/`);
  const shareStatus = createElement('p', 'share-status');
  shareStatus.setAttribute('aria-live', 'polite');
  share.addEventListener('click', () => shareGame(game, choice, shareStatus));
  actions.append(share, next);

  detail.append(resultTop, bars, sourceNote, actions, shareStatus);
  screen.append(hero, detail);
  app?.replaceChildren(screen);
}

async function handleVote(choice) {
  if (state.voting || !state.game) return;
  state.voting = true;
  document.querySelectorAll('.balance-choice').forEach((button) => {
    button.disabled = true;
    button.classList.toggle('selected', button.dataset.choice === choice);
  });
  const status = document.querySelector('.balance-vote-status');
  if (status) status.textContent = '선택 결과를 집계하고 있어요…';

  const localResult = saveLocalVote(state.game.slug, choice);
  try {
    const remoteResult = await submitRemoteVote(state.game, localResult.choice);
    cacheRemoteVote(state.game.slug, remoteResult.choice, remoteResult.stats);
    renderResult(state.game, remoteResult.choice, remoteResult.stats, 'remote');
  } catch (error) {
    console.warn('전체 투표 집계 연결 지연:', error.message);
    renderResult(state.game, localResult.choice, localResult.stats, 'local');
  } finally {
    state.voting = false;
  }
}

async function restoreVote(choice) {
  const storedStats = normalizeVoteStats(getLocalStats()[state.game.slug]);
  const localStats = storedStats.total ? storedStats : applyVote({}, choice);
  renderResult(state.game, choice, localStats, 'local');
  try {
    const remoteResult = await submitRemoteVote(state.game, choice);
    cacheRemoteVote(state.game.slug, remoteResult.choice, remoteResult.stats);
    renderResult(state.game, remoteResult.choice, remoteResult.stats, 'remote');
  } catch (error) {
    console.warn('저장된 투표의 전체 집계 연결 지연:', error.message);
  }
}

function createCatalogCard(game) {
  const link = createElement('a', 'balance-catalog-card');
  link.href = toSiteUrl(`/vote/${game.slug}/`);
  const top = createElement('div', 'balance-card-top');
  top.append(
    createElement('span', 'balance-card-icon', game.icon || '⚖️'),
    createElement('span', 'balance-card-category', game.category)
  );
  const options = createElement('div', 'balance-card-options');
  options.append(
    createElement('span', '', game.options[0].shortLabel),
    createElement('b', '', 'VS'),
    createElement('span', '', game.options[1].shortLabel)
  );
  link.append(top, createElement('h3', '', game.question), options);
  if (getStoredChoices()[game.slug]) {
    link.append(createElement('small', 'balance-card-done', '✓ 참여 완료 · 결과 다시 보기'));
  } else {
    link.append(createElement('small', 'balance-card-action', '10초 선택 →'));
  }
  return link;
}

function renderCatalog() {
  const grid = document.querySelector('#balance-catalog-grid');
  const status = document.querySelector('#balance-catalog-status');
  if (!grid) return;
  const visibleGames = state.category === 'all'
    ? state.games
    : state.games.filter((game) => game.category === state.category);
  grid.replaceChildren(...visibleGames.map(createCatalogCard));
  if (status) status.textContent = `${visibleGames.length}개 질문`;
}

function renderRecommendations() {
  const grid = document.querySelector('#recommended-balance-games');
  if (!grid || !state.game) return;
  const startIndex = state.games.findIndex((game) => game.slug === state.game.slug);
  const recommendations = [1, 2, 3]
    .map((offset) => state.games[(startIndex + offset) % state.games.length])
    .filter(Boolean);
  grid.replaceChildren(...recommendations.map(createCatalogCard));
}

function setupFilters() {
  document.querySelectorAll('[data-balance-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.balanceCategory || 'all';
      document.querySelectorAll('[data-balance-category]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      renderCatalog();
    });
  });
}

function renderLoadError() {
  const screen = createElement('div', 'test-empty-state');
  screen.append(
    createElement('span', 'test-loading-icon', '😵'),
    createElement('h1', '', '밸런스 게임을 불러오지 못했어요'),
    createElement('p', '', '잠시 후 다시 시도해 주세요.')
  );
  const home = createElement('a', 'test-start-button', '홈으로 돌아가기');
  home.href = toSiteUrl('/');
  screen.append(home);
  app?.replaceChildren(screen);
}

function renderUnpublishedBalanceGame() {
  const screen = createElement('div', 'test-empty-state');
  screen.append(
    createElement('span', 'test-loading-icon', '⚖️'),
    createElement('h1', '', '새 밸런스게임을 준비 중이에요'),
    createElement('p', '', '아직 공개되지 않은 슬롯입니다. 지금 참여 가능한 질문을 먼저 골라보세요.')
  );
  const listLink = createElement('a', 'test-start-button', '공개 밸런스게임 보기');
  listLink.href = toSiteUrl('/vote/');
  screen.append(listLink);
  app?.replaceChildren(screen);
}

async function loadBalanceGames() {
  try {
    state.games = await loadPublishedBalanceGames();
    state.game = requestedSlug
      ? state.games.find((game) => game.slug === requestedSlug)
      : selectDailyGame(state.games, todayKey);
    if (!state.game) {
      renderUnpublishedBalanceGame();
      return;
    }

    document.querySelector('#published-balance-count')?.replaceChildren(String(state.games.length));
    renderCatalog();
    renderRecommendations();

    const storedChoice = getStoredChoices()[state.game.slug];
    if (storedChoice) {
      restoreVote(storedChoice);
    } else {
      renderQuestion(state.game);
    }
  } catch (error) {
    console.warn('밸런스 게임 로드 오류:', error.message);
    renderLoadError();
  }
}

setupFilters();
loadBalanceGames();
