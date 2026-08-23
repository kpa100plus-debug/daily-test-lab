import { formatGameScore } from './mini-game-engine.js';
import {
  getMemberDashboard,
  signInWithGoogle,
  signOutMember
} from './member-service.js';

const buildStep = 'REF-DAILYFUN-STEP6-MEMBER-SCORE-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/my-app\.js$/, '');
const gamesUrl = new URL('../../data/mini-games.json', import.meta.url);
const dashboard = document.querySelector('#member-dashboard');

document.documentElement.dataset.buildStep = buildStep;

let games = [];

const toSiteUrl = (route) => `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getInitial(user) {
  return (user.displayName || user.email || 'M').trim().charAt(0).toUpperCase();
}

function createRecordCard(game, record) {
  const link = createElement('a', 'member-record-card');
  link.href = toSiteUrl(`/game/${game.slug}/`);
  link.dataset.accent = game.accent;
  const top = createElement('div', 'member-record-card-top');
  top.append(
    createElement('span', 'member-record-icon', game.icon),
    createElement('span', 'member-record-category', game.category)
  );
  link.append(
    top,
    createElement('h3', '', game.title),
    createElement('span', 'member-record-label', game.recordLabel),
    createElement('strong', 'member-record-value', record
      ? formatGameScore(game.slug, record.best)
      : '첫 기록 도전'),
    createElement('small', '', record ? `${record.attempts || 0}회 도전` : '게임을 시작해 보세요'),
    createElement('b', '', '플레이 →')
  );
  return link;
}

function renderDashboard(user, records) {
  const isMember = !user.isAnonymous;
  const shell = createElement('div', 'member-dashboard-content');
  const account = createElement('section', 'member-account-card');
  const profile = createElement('div', 'member-profile');
  const avatar = createElement('span', 'member-avatar', isMember ? getInitial(user) : 'G');
  const copy = createElement('div', 'member-profile-copy');
  copy.append(
    createElement('span', 'member-status-badge', isMember ? '회원 기록 동기화 중' : '게스트 모드'),
    createElement('h2', '', isMember ? `${user.displayName || '회원'}님의 기록` : '게스트로 기록 중'),
    createElement('p', '', isMember
      ? `${user.email || ''} · 다른 기기에서도 같은 계정으로 이어볼 수 있어요.`
      : '현재 기록은 익명 Firebase 계정과 이 브라우저에 저장됩니다.')
  );
  profile.append(avatar, copy);

  const accountAction = createElement('button', isMember ? 'member-signout-button' : 'member-google-button');
  accountAction.type = 'button';
  accountAction.textContent = isMember ? '로그아웃' : 'Google로 기록 보관';
  const actionStatus = createElement('p', 'member-action-status');
  actionStatus.setAttribute('aria-live', 'polite');

  if (isMember) {
    accountAction.addEventListener('click', async () => {
      accountAction.disabled = true;
      actionStatus.textContent = '로그아웃하고 있어요…';
      try {
        await signOutMember();
        location.reload();
      } catch {
        accountAction.disabled = false;
        actionStatus.textContent = '로그아웃을 다시 시도해 주세요.';
      }
    });
  } else {
    accountAction.addEventListener('click', async () => {
      accountAction.disabled = true;
      actionStatus.textContent = 'Google 로그인 창을 여는 중…';
      try {
        await signInWithGoogle(games);
        location.reload();
      } catch (error) {
        accountAction.disabled = false;
        if (error?.code === 'auth/popup-closed-by-user') {
          actionStatus.textContent = '로그인이 취소됐어요. 원할 때 다시 눌러주세요.';
        } else {
          actionStatus.textContent = 'Google 로그인을 다시 시도해 주세요.';
        }
      }
    });
  }

  account.append(profile, accountAction, actionStatus);

  const recordSection = createElement('section', 'member-record-section');
  const heading = createElement('div', 'member-record-heading');
  heading.append(
    createElement('div', '', ''),
    createElement('span', '', isMember ? '● Firebase 동기화 완료' : '● 게스트 기록 저장 중')
  );
  heading.firstElementChild.append(
    createElement('p', 'section-kicker', 'MY BEST RECORDS'),
    createElement('h2', '', '미니게임 최고 기록')
  );
  const grid = createElement('div', 'member-record-grid');
  grid.append(...games.map((game) => createRecordCard(game, records[game.slug])));
  recordSection.append(heading, grid);
  shell.append(account, recordSection);
  dashboard?.replaceChildren(shell);
}

function renderError() {
  const error = createElement('div', 'member-error');
  error.append(
    createElement('span', '', '🧩'),
    createElement('h2', '', '기록을 불러오지 못했어요'),
    createElement('p', '', '인터넷 연결을 확인하고 다시 시도해 주세요.')
  );
  const retry = createElement('button', 'member-google-button', '다시 불러오기');
  retry.type = 'button';
  retry.addEventListener('click', initialize);
  error.append(retry);
  dashboard?.replaceChildren(error);
}

async function initialize() {
  try {
    const response = await fetch(gamesUrl);
    if (!response.ok) throw new Error('게임 데이터를 불러오지 못했습니다.');
    const data = await response.json();
    games = (data.items || []).filter((game) => game.status === 'published');
    const { user, records } = await getMemberDashboard(games);
    renderDashboard(user, records);
  } catch (error) {
    console.warn('회원 기록 연결 지연:', error.message);
    renderError();
  }
}

initialize();
