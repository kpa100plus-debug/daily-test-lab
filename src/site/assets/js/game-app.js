import { shareOrCopy } from './share-service.js';
import { localizeContentData } from './locale.js?v=i18n-2';
import {
  createNumberBoard,
  createReactionDelay,
  extendMemorySequence,
  formatGameScore,
  getGameRating,
  isBetterScore
} from './mini-game-engine.js';
import {
  hasRecordSession,
  saveGameAttempt,
  synchronizeLocalGameRecords
} from './member-service.js';

const buildStep = 'REF-DAILYFUN-STEP6-MEMBER-SCORE-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/game-app\.js$/, '');
const gamesUrl = new URL('../../data/mini-games.json', import.meta.url);
const requestedSlug = document.body.dataset.gameSlug || '';
const app = document.querySelector('#mini-game-app');
const RECORD_KEY = 'daily-test-lab.game-records.v1';

document.documentElement.dataset.buildStep = buildStep;

let games = [];
let game = null;
let runtimeToken = 0;
let reactionTimer = null;

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
      // 저장이 제한된 환경에서도 현재 게임은 계속 동작합니다.
    }
  }
};

const toSiteUrl = (route) => `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getRecords() {
  return safeStorage.get(RECORD_KEY, {});
}

function getRecord() {
  return getRecords()[game.slug] || null;
}

function stopRuntime() {
  runtimeToken += 1;
  if (reactionTimer) clearTimeout(reactionTimer);
  reactionTimer = null;
}

function incrementPlayCount() {
  const key = 'daily-test-lab.play-count.v1';
  const count = Number(safeStorage.get(key, 0)) || 0;
  safeStorage.set(key, count + 1);
}

function saveAttempt(score) {
  const records = getRecords();
  const previous = records[game.slug] || {};
  const bestWasBroken = isBetterScore(game.scoreDirection, score, Number(previous.best));
  const best = bestWasBroken ? score : Number(previous.best);
  const record = {
    best,
    last: score,
    attempts: (Number(previous.attempts) || 0) + 1,
    updatedAt: new Date().toISOString()
  };
  records[game.slug] = record;
  safeStorage.set(RECORD_KEY, records);
  incrementPlayCount();
  return { record, bestWasBroken };
}

function getNextGame() {
  const index = games.findIndex((item) => item.slug === game.slug);
  return games[(index + 1 + games.length) % games.length];
}

function focusApp() {
  app?.focus({ preventScroll: true });
}

async function shareResult(score, status) {
  const shareUrl = new URL(toSiteUrl(`/game/${game.slug}/`), location.origin).href;
  const shareData = {
    title: `${game.title} | DAILY TEST LAB`,
    text: `${game.shareText} 내 기록은 ${formatGameScore(game.slug, score)}!`,
    url: shareUrl
  };
  const outcome = await shareOrCopy(shareData);
  if (outcome.method === 'shared') status.textContent = '친구에게 공유했어요.';
  if (outcome.method === 'copied') status.textContent = '기록과 링크를 복사했어요. 원하는 곳에 붙여넣으세요.';
  if (outcome.method === 'cancelled') status.textContent = '공유를 취소했어요.';
  if (outcome.method === 'manual') status.textContent = '공유 내용을 직접 복사해 주세요.';
}

function renderIntro() {
  stopRuntime();
  const record = getRecord();
  const screen = createElement('div', 'mini-game-intro');
  screen.dataset.screen = 'intro';
  screen.dataset.accent = game.accent;

  const meta = createElement('div', 'mini-game-meta-row');
  meta.append(
    createElement('span', '', game.category),
    createElement('span', '', game.duration),
    createElement('span', '', '무료 · 설치 없음')
  );

  const recordBox = createElement('div', 'mini-game-intro-record');
  recordBox.append(
    createElement('span', '', game.recordLabel),
    createElement('strong', '', record?.best !== undefined
      ? formatGameScore(game.slug, record.best)
      : '아직 기록 없음'),
    createElement('small', '', record ? `${record.attempts}회 도전` : '첫 기록을 만들어보세요')
  );

  const start = createElement('button', 'mini-game-start-button', '게임 시작');
  start.type = 'button';
  start.addEventListener('click', startGame);

  screen.append(
    createElement('span', 'mini-game-main-icon', game.icon),
    meta,
    createElement('p', 'section-kicker', '10 SECOND GAME LAB'),
    createElement('h1', '', game.title),
    createElement('p', 'mini-game-lead', game.description),
    recordBox,
    start,
    createElement('p', 'mini-game-instruction', game.instruction)
  );
  app?.replaceChildren(screen);
  focusApp();
}

function renderResult(score, extraMessage = '') {
  stopRuntime();
  const { record, bestWasBroken } = saveAttempt(score);
  const rating = getGameRating(game.slug, score);
  const nextGame = getNextGame();
  const screen = createElement('div', 'mini-game-result');
  screen.dataset.screen = 'result';
  screen.dataset.accent = game.accent;

  const hero = createElement('div', 'mini-game-result-hero');
  hero.append(
    createElement('p', 'mini-game-result-kicker', 'TODAY RECORD'),
    createElement('span', 'mini-game-result-emoji', rating.emoji),
    createElement('span', 'mini-game-result-label', bestWasBroken ? 'NEW BEST' : '이번 기록'),
    createElement('h1', '', formatGameScore(game.slug, score)),
    createElement('strong', '', rating.title),
    createElement('p', '', rating.description)
  );

  const detail = createElement('div', 'mini-game-result-detail');
  const stats = createElement('div', 'mini-game-result-stats');
  const bestCard = createElement('div', 'mini-game-result-stat');
  const bestValue = createElement('strong', '', formatGameScore(game.slug, record.best));
  bestCard.append(
    createElement('span', '', game.recordLabel),
    bestValue
  );
  const attemptsCard = createElement('div', 'mini-game-result-stat');
  const attemptsValue = createElement('strong', '', `${record.attempts}회`);
  attemptsCard.append(
    createElement('span', '', '누적 도전'),
    attemptsValue
  );
  stats.append(bestCard, attemptsCard);

  const actions = createElement('div', 'mini-game-result-actions');
  const replay = createElement('button', 'mini-game-replay-button', '다시 도전');
  replay.type = 'button';
  replay.addEventListener('click', startGame);
  const share = createElement('button', 'mini-game-share-button', '기록 공유');
  share.type = 'button';
  const shareStatus = createElement('p', 'share-status');
  shareStatus.setAttribute('aria-live', 'polite');
  const syncStatus = createElement('p', 'mini-game-sync-status', 'Firebase에 기록을 저장하는 중…');
  syncStatus.setAttribute('aria-live', 'polite');
  share.addEventListener('click', () => shareResult(score, shareStatus));
  const next = createElement('a', 'mini-game-next-button', `${nextGame.shortTitle} 도전 →`);
  next.href = toSiteUrl(`/game/${nextGame.slug}/`);
  actions.append(replay, share, next);

  detail.append(stats);
  if (extraMessage) detail.append(createElement('p', 'mini-game-extra-message', extraMessage));
  detail.append(syncStatus, actions, shareStatus);
  screen.append(hero, detail);
  app?.replaceChildren(screen);
  focusApp();

  saveGameAttempt(game, record)
    .then(({ user, record: savedRecord }) => {
      bestValue.textContent = formatGameScore(game.slug, savedRecord.best);
      attemptsValue.textContent = `${savedRecord.attempts}회`;
      syncStatus.classList.add('is-saved');
      syncStatus.textContent = user.isAnonymous
        ? '● Firebase 게스트 기록에 저장됨 · 로그인하면 다른 기기에서도 이어집니다.'
        : '● 회원 기록에 안전하게 저장됐어요.';
    })
    .catch(() => {
      syncStatus.textContent = '이 기기에 기록했어요. Firebase 연결 시 자동으로 동기화됩니다.';
    });
}

function renderFalseStart() {
  stopRuntime();
  const screen = createElement('div', 'reaction-false-start');
  screen.append(
    createElement('span', '', '✋'),
    createElement('p', 'section-kicker', 'TOO SOON'),
    createElement('h1', '', '너무 빨랐어요!'),
    createElement('p', '', '초록색으로 바뀐 뒤에 눌러야 기록이 측정돼요.')
  );
  const retry = createElement('button', 'mini-game-start-button', '다시 준비');
  retry.type = 'button';
  retry.addEventListener('click', startReactionGame);
  screen.append(retry);
  app?.replaceChildren(screen);
  focusApp();
}

function startReactionGame() {
  stopRuntime();
  const token = runtimeToken;
  let phase = 'waiting';
  let readyAt = 0;
  const screen = createElement('div', 'reaction-game-screen');
  const top = createElement('div', 'mini-game-play-top');
  top.append(
    createElement('span', '', '반응속도 테스트'),
    createElement('span', '', '초록색을 기다리세요')
  );
  const target = createElement('button', 'reaction-target is-waiting');
  target.type = 'button';
  target.setAttribute('aria-label', '반응속도 측정 영역');
  target.append(
    createElement('span', 'reaction-target-icon', '⏳'),
    createElement('strong', '', '기다리세요…'),
    createElement('small', '', '아직 누르지 마세요')
  );

  target.addEventListener('click', () => {
    if (phase === 'waiting') {
      renderFalseStart();
      return;
    }
    if (phase !== 'ready') return;
    phase = 'done';
    const score = Math.max(1, Math.round(performance.now() - readyAt));
    renderResult(score);
  });

  screen.append(top, target);
  app?.replaceChildren(screen);
  focusApp();

  reactionTimer = setTimeout(() => {
    if (token !== runtimeToken || phase !== 'waiting') return;
    phase = 'ready';
    readyAt = performance.now();
    target.className = 'reaction-target is-ready';
    target.replaceChildren(
      createElement('span', 'reaction-target-icon', '⚡'),
      createElement('strong', '', '지금!'),
      createElement('small', '', '최대한 빠르게 터치하세요')
    );
  }, createReactionDelay());
}

function startMemoryGame() {
  stopRuntime();
  const token = runtimeToken;
  const tileCount = 6;
  const goal = 8;
  let sequence = [];
  let completedRounds = 0;
  let inputIndex = 0;
  let acceptingInput = false;
  for (let index = 0; index < 3; index += 1) {
    sequence = extendMemorySequence(sequence, tileCount);
  }

  const screen = createElement('div', 'memory-game-screen');
  const top = createElement('div', 'mini-game-play-top');
  const level = createElement('span', '', '1단계');
  const status = createElement('span', '', '순서를 기억하세요');
  top.append(level, status);
  const board = createElement('div', 'memory-board');
  const tiles = Array.from({ length: tileCount }, (_, index) => {
    const tile = createElement('button', `memory-tile memory-tile-${index + 1}`);
    tile.type = 'button';
    tile.setAttribute('aria-label', `${index + 1}번 기억 타일`);
    tile.addEventListener('click', () => handleTile(index));
    board.append(tile);
    return tile;
  });
  const helper = createElement('p', 'memory-helper', '빛나는 타일을 차례로 기억하세요.');
  screen.append(top, board, helper);
  app?.replaceChildren(screen);
  focusApp();

  async function previewSequence() {
    acceptingInput = false;
    inputIndex = 0;
    level.textContent = `${completedRounds + 1}단계`;
    status.textContent = '순서를 기억하세요';
    helper.textContent = `${sequence.length}개의 순서가 빛납니다.`;
    board.classList.remove('is-input');
    await wait(650);
    for (const tileIndex of sequence) {
      if (token !== runtimeToken) return;
      tiles[tileIndex].classList.add('active');
      await wait(430);
      tiles[tileIndex].classList.remove('active');
      await wait(170);
    }
    if (token !== runtimeToken) return;
    acceptingInput = true;
    status.textContent = '같은 순서로 누르세요';
    helper.textContent = '이제 기억한 순서대로 눌러보세요.';
    board.classList.add('is-input');
  }

  async function handleTile(tileIndex) {
    if (!acceptingInput || token !== runtimeToken) return;
    tiles[tileIndex].classList.add('pressed');
    setTimeout(() => tiles[tileIndex]?.classList.remove('pressed'), 150);
    if (sequence[inputIndex] !== tileIndex) {
      acceptingInput = false;
      tiles[tileIndex].classList.add('wrong');
      status.textContent = '순서가 달라요';
      await wait(300);
      if (token === runtimeToken) renderResult(completedRounds, `이번에는 ${sequence.length}개의 순서에 도전했어요.`);
      return;
    }

    inputIndex += 1;
    if (inputIndex < sequence.length) {
      helper.textContent = `${inputIndex} / ${sequence.length} 입력`;
      return;
    }

    acceptingInput = false;
    completedRounds += 1;
    if (completedRounds >= goal) {
      status.textContent = '모든 단계 성공!';
      await wait(350);
      if (token === runtimeToken) renderResult(completedRounds, '8단계 완주! 오늘의 기억력 미션을 모두 통과했어요.');
      return;
    }

    status.textContent = '정답! 다음 단계';
    helper.textContent = '순서가 하나 더 늘어납니다.';
    sequence = extendMemorySequence(sequence, tileCount);
    await wait(700);
    if (token === runtimeToken) previewSequence();
  }

  previewSequence();
}

function startNumberGame() {
  stopRuntime();
  const token = runtimeToken;
  const numbers = createNumberBoard(12);
  let expected = 1;
  let mistakes = 0;
  let startedAt = performance.now();
  const screen = createElement('div', 'number-game-screen');
  const top = createElement('div', 'mini-game-play-top');
  const progress = createElement('span', '', '다음 숫자: 1');
  const timerLabel = createElement('span', '', '기록 측정 중');
  top.append(progress, timerLabel);
  const board = createElement('div', 'number-board');
  const status = createElement('p', 'number-helper', '1부터 12까지 순서대로 누르세요.');

  numbers.forEach((number) => {
    const button = createElement('button', 'number-tile', String(number));
    button.type = 'button';
    button.setAttribute('aria-label', `${number} 선택`);
    button.addEventListener('click', () => {
      if (token !== runtimeToken || button.disabled) return;
      if (number !== expected) {
        mistakes += 1;
        button.classList.remove('wrong');
        void button.offsetWidth;
        button.classList.add('wrong');
        status.textContent = `${expected}부터 찾아보세요. 틀린 선택 ${mistakes}회`;
        return;
      }

      button.disabled = true;
      button.classList.add('done');
      expected += 1;
      if (expected <= 12) {
        progress.textContent = `다음 숫자: ${expected}`;
        status.textContent = `${expected - 1} / 12 완료`;
        return;
      }

      const score = Math.max(1, Math.round(performance.now() - startedAt));
      progress.textContent = '완료!';
      timerLabel.textContent = formatGameScore(game.slug, score);
      renderResult(score, mistakes ? `틀린 선택 ${mistakes}회 · 다음에는 더 빠를 수 있어요.` : '한 번도 틀리지 않고 완주했어요!');
    });
    board.append(button);
  });

  screen.append(top, board, status);
  app?.replaceChildren(screen);
  requestAnimationFrame(() => { startedAt = performance.now(); });
  focusApp();
}

function startGame() {
  if (game.slug === 'reaction-speed') startReactionGame();
  else if (game.slug === 'memory') startMemoryGame();
  else startNumberGame();
}

function renderError() {
  const screen = createElement('div', 'mini-game-error');
  screen.append(
    createElement('span', '', '🧩'),
    createElement('h1', '', '게임을 불러오지 못했어요'),
    createElement('p', '', '게임 목록으로 돌아가 다시 선택해 주세요.')
  );
  const link = createElement('a', 'mini-game-next-button', '게임 목록 보기');
  link.href = toSiteUrl('/game/');
  screen.append(link);
  app?.replaceChildren(screen);
}

async function initialize() {
  try {
    const response = await fetch(gamesUrl);
    if (!response.ok) throw new Error('게임 데이터를 불러오지 못했습니다.');
    const data = await localizeContentData(await response.json());
    games = (data.items || []).filter((item) => item.status === 'published');
    game = games.find((item) => item.slug === requestedSlug);
    if (!game) throw new Error('게임을 찾을 수 없습니다.');
    renderIntro();
    if (hasRecordSession()) {
      synchronizeLocalGameRecords(games)
        .then(() => {
          if (app?.querySelector('[data-screen="intro"]')) renderIntro();
        })
        .catch(() => {});
    }
  } catch (error) {
    renderError();
  }
}

initialize();
document.addEventListener('daily-test-lab:locale-ready', () => {
  stopRuntime();
  initialize();
});
