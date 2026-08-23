import { formatGameScore } from './mini-game-engine.js';
import {
  hasRecordSession,
  readLocalGameRecords,
  synchronizeLocalGameRecords
} from './member-service.js';

const buildStep = 'REF-DAILYFUN-STEP6-MEMBER-SCORE-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/game-list\.js$/, '');
const gamesUrl = new URL('../../data/mini-games.json', import.meta.url);
const catalog = document.querySelector('#mini-game-catalog');
const totalAttempts = document.querySelector('#game-total-attempts');

document.documentElement.dataset.buildStep = buildStep;

let records = readLocalGameRecords();
const toSiteUrl = (route) => `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createGameCard(game) {
  const record = records[game.slug];
  const link = createElement('a', 'mini-game-card');
  link.href = toSiteUrl(`/game/${game.slug}/`);
  link.dataset.accent = game.accent;

  const top = createElement('div', 'mini-game-card-top');
  top.append(
    createElement('span', 'mini-game-card-icon', game.icon),
    createElement('span', 'mini-game-card-duration', game.duration)
  );

  const recordBox = createElement('div', 'mini-game-card-record');
  recordBox.append(
    createElement('span', '', game.recordLabel),
    createElement('strong', '', record?.best !== undefined
      ? formatGameScore(game.slug, record.best)
      : '첫 기록 도전')
  );

  link.append(
    top,
    createElement('span', 'mini-game-card-category', game.category),
    createElement('h2', '', game.title),
    createElement('p', '', game.description),
    recordBox,
    createElement('span', 'mini-game-card-action', '지금 플레이 →')
  );
  return link;
}

async function initialize() {
  try {
    const response = await fetch(gamesUrl);
    if (!response.ok) throw new Error('게임 목록을 불러오지 못했습니다.');
    const data = await response.json();
    const games = (data.items || []).filter((game) => game.status === 'published');
    catalog?.replaceChildren(...games.map(createGameCard));
    const attempts = Object.values(records).reduce(
      (sum, record) => sum + (Number(record?.attempts) || 0),
      0
    );
    if (totalAttempts) totalAttempts.textContent = attempts.toLocaleString('ko-KR');
    if (hasRecordSession()) synchronizeLocalGameRecords(games)
      .then((result) => {
        records = result.records;
        catalog?.replaceChildren(...games.map(createGameCard));
        const synchronizedAttempts = Object.values(records).reduce(
          (sum, record) => sum + (Number(record?.attempts) || 0),
          0
        );
        if (totalAttempts) totalAttempts.textContent = synchronizedAttempts.toLocaleString('ko-KR');
      })
      .catch(() => {});
  } catch (error) {
    const message = createElement('div', 'mini-game-list-error');
    message.append(
      createElement('strong', '', '게임을 불러오지 못했어요'),
      createElement('p', '', '잠시 후 새로고침해 주세요.')
    );
    catalog?.replaceChildren(message);
  }
}

initialize();
