import { getFirebaseServices } from './firebase-client.js';
import { hasScheduledDailyContent, normalizeDailyContent, selectDailyContentItem } from './daily-content-engine.js';

const buildStep = 'REF-DAILYFUN-STEP7-ADMIN-DAILY-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/app\.js$/, '');
const dailyContentUrl = new URL('../../data/daily-content.json', import.meta.url);
const koreaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const todayKey = koreaDateFormatter.format(new Date());

document.documentElement.dataset.buildStep = buildStep;

const toSiteUrl = (route) => {
  if (!route || route.startsWith('#') || /^https?:\/\//.test(route)) return route;
  return `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;
};

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
      // 개인정보 차단 모드에서는 화면만 정상 동작하게 둡니다.
    }
  }
};

function setTodayLabel() {
  const label = document.querySelector('#today-label');
  if (!label) return;

  const formatted = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date());
  label.textContent = `${formatted} · 오늘도 가볍게 한 판`;
}

function calculateStreak(days) {
  const daySet = new Set(days);
  let streak = 0;
  const cursor = new Date(`${todayKey}T00:00:00+09:00`);

  while (daySet.has(koreaDateFormatter.format(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return Math.max(streak, 1);
}

function updateVisitStats() {
  const visitKey = 'daily-test-lab.visit-days.v1';
  const storedDays = safeStorage.get(visitKey, []);
  const days = [...new Set([...storedDays, todayKey])].sort().slice(-90);
  safeStorage.set(visitKey, days);

  const playCount = Number(safeStorage.get('daily-test-lab.play-count.v1', 0)) || 0;
  document.querySelector('#visit-streak')?.replaceChildren(String(calculateStreak(days)));
  document.querySelector('#visit-days')?.replaceChildren(String(days.length));
  document.querySelector('#play-count')?.replaceChildren(String(playCount));
}

function incrementPlayCount() {
  const key = 'daily-test-lab.play-count.v1';
  const nextCount = (Number(safeStorage.get(key, 0)) || 0) + 1;
  safeStorage.set(key, nextCount);
  document.querySelector('#play-count')?.replaceChildren(String(nextCount));
}

function createMeta(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

function createContentLink(item, className) {
  const link = document.createElement('a');
  link.className = className;
  link.href = toSiteUrl(item.route);
  if (!item.route?.startsWith('#')) link.dataset.trackPlay = '';
  return link;
}

async function shareDailyItem(item, statusTarget) {
  const shareData = {
    title: `DAILY TEST LAB · ${item.title}`,
    text: item.description,
    url: new URL(toSiteUrl(item.route), location.origin).href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      statusTarget.textContent = '공유 완료';
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    statusTarget.textContent = '주소 복사됨';
  } catch (error) {
    if (error?.name !== 'AbortError') statusTarget.textContent = '다시 시도';
  }
}

function renderDailyFeature(item) {
  const feature = document.querySelector('#daily-feature');
  if (!feature || !item) return;

  feature.replaceChildren();
  feature.dataset.accent = item.accent || 'violet';

  const icon = document.createElement('div');
  icon.className = 'feature-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = item.icon || '✨';

  const body = document.createElement('div');
  body.className = 'feature-body';

  const meta = document.createElement('div');
  meta.className = 'feature-meta';
  meta.append(createMeta(item.category || '오늘 추천'), createMeta(item.duration || '약 2분'));

  const title = document.createElement('h3');
  title.textContent = item.title;
  const description = document.createElement('p');
  description.textContent = item.description;

  const actions = document.createElement('div');
  actions.className = 'feature-actions';
  const start = createContentLink(item, 'feature-button');
  start.textContent = item.actionLabel || '지금 시작';
  const share = document.createElement('button');
  share.className = 'share-button';
  share.type = 'button';
  share.textContent = '공유';
  share.setAttribute('aria-label', `${item.title} 공유`);
  share.addEventListener('click', () => shareDailyItem(item, share));

  actions.append(start, share);
  body.append(meta, title, description, actions);
  feature.append(icon, body);
}

function renderPopularItems(items, selectedItem) {
  const grid = document.querySelector('#popular-content-grid');
  if (!grid || !Array.isArray(items) || !items.length) return;

  const popularItems = items
    .filter((item) => item.id !== selectedItem?.id && item.route !== selectedItem?.route)
    .slice(0, 3);
  if (!popularItems.length) return;
  grid.replaceChildren();

  for (const item of popularItems) {
    const card = createContentLink(item, 'content-card');
    const icon = document.createElement('span');
    icon.className = 'content-card-icon';
    icon.textContent = item.icon || '✨';
    const tag = document.createElement('span');
    tag.className = 'content-tag';
    tag.textContent = `${item.category || '추천'} · ${item.duration || '짧게'}`;
    const title = document.createElement('strong');
    title.textContent = item.title;
    const note = document.createElement('small');
    note.textContent = item.note || item.description;
    card.append(icon, tag, title, note);
    grid.append(card);
  }
}

async function loadDailyContent() {
  let data;
  try {
    const response = await fetch(dailyContentUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`daily content ${response.status}`);
    data = await response.json();
    const selectedItem = selectDailyContentItem(data, todayKey);
    renderDailyFeature(selectedItem);
    renderPopularItems(data.items, selectedItem);
    if (hasScheduledDailyContent(data, todayKey)) return;
  } catch (error) {
    console.warn('오늘의 콘텐츠를 기본 화면으로 표시합니다.', error.message);
    return;
  }

  try {
    const services = await getFirebaseServices();
    const { doc, getDoc } = services.firestoreSdk;
    const snapshot = await getDoc(doc(services.db, 'daily_contents', 'current'));
    if (!snapshot.exists() || snapshot.data().status !== 'published') return;
    const remoteItem = normalizeDailyContent(snapshot.data());
    renderDailyFeature(remoteItem);
    renderPopularItems(data.items, remoteItem);
    document.querySelector('#daily-feature')?.setAttribute('data-content-source', 'firebase');
  } catch (error) {
    console.warn('관리자 지정 콘텐츠 연결 지연:', error.message);
  }
}

function showQuizResult(answer) {
  const result = document.querySelector('#quiz-result');
  const buttons = document.querySelectorAll('[data-quiz-answer]');
  const correctAnswer = 'hippocampus';

  buttons.forEach((button) => {
    const isSelected = button.dataset.quizAnswer === answer;
    const isCorrect = button.dataset.quizAnswer === correctAnswer;
    button.setAttribute('aria-pressed', String(isSelected));
    button.classList.toggle('correct', isCorrect);
    button.classList.toggle('wrong', isSelected && !isCorrect);
  });

  if (!result) return;
  result.textContent = answer === correctAnswer
    ? '정답이에요! 해마는 새로운 기억의 형성과 학습에 중요한 역할을 해요.'
    : '아쉬워요. 정답은 B. 해마예요. 새로운 기억을 만드는 데 중요한 역할을 합니다.';
}

function setupQuiz() {
  const answerKey = `daily-test-lab.quiz.${todayKey}`;
  const savedAnswer = safeStorage.get(answerKey, null);
  if (savedAnswer) showQuizResult(savedAnswer);

  document.querySelectorAll('[data-quiz-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const alreadyAnswered = Boolean(safeStorage.get(answerKey, null));
      const answer = button.dataset.quizAnswer;
      safeStorage.set(answerKey, answer);
      showQuizResult(answer);
      if (!alreadyAnswered) incrementPlayCount();
    });
  });
}

function setupPlayTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-track-play]');
    if (target) incrementPlayCount();
  });
}

const serviceStatSources = {
  tests: new URL('../../data/tests.json', import.meta.url),
  balance: new URL('../../data/balance-games.json', import.meta.url),
  games: new URL('../../data/mini-games.json', import.meta.url)
};

const formatStatNumber = (value) => new Intl.NumberFormat(
  document.documentElement.lang || 'ko'
).format(value);

async function loadPublishedCount(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`service stat ${response.status}`);
  const data = await response.json();
  return (data.items || []).filter((item) => item.status === 'published').length;
}

async function updateServiceStats() {
  try {
    const [tests, balance, games] = await Promise.all([
      loadPublishedCount(serviceStatSources.tests),
      loadPublishedCount(serviceStatSources.balance),
      loadPublishedCount(serviceStatSources.games)
    ]);
    document.querySelector('#published-test-count')?.replaceChildren(formatStatNumber(tests));
    document.querySelector('#balance-question-count')?.replaceChildren(formatStatNumber(balance));
    document.querySelector('#mini-game-count')?.replaceChildren(formatStatNumber(games));
  } catch (error) {
    console.warn('공개 콘텐츠 수 집계 지연:', error.message);
  }
}

const visitorCounterBaseUrl = 'https://counterapi.com/api/dtlabkr.dpdns.org/view/home';

async function fetchVisitorCount(timeline, readOnly = false) {
  const parameters = new URLSearchParams({ timeline, unique: 'true' });
  if (readOnly) parameters.set('readOnly', 'true');
  const response = await fetch(
    `${visitorCounterBaseUrl}?${parameters.toString()}`,
    { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }
  );
  if (!response.ok) throw new Error(`visitor counter ${response.status}`);
  const data = await response.json();
  return Math.max(0, Number(data.value) || 0);
}

function renderVisitorCount(targetId, result) {
  const target = document.querySelector(`#${targetId}`);
  if (!target) return;
  const card = target.closest('.global-stat-card');
  if (result.status === 'fulfilled') {
    target.dataset.rawValue = String(result.value);
    target.replaceChildren(formatStatNumber(result.value));
    card?.setAttribute('data-counter-status', 'ready');
    return;
  }
  target.replaceChildren('—');
  card?.setAttribute('data-counter-status', 'delayed');
}

async function updateVisitorCounts() {
  const allowedHost = /^(dtlabkr\.dpdns\.org|kpa100plus-debug\.github\.io)$/.test(location.hostname);
  if (!allowedHost || !document.querySelector('#global-visitor-count')) return;

  const todayResult = await Promise.allSettled([fetchVisitorCount('1d')]);
  renderVisitorCount('global-visitor-count', todayResult[0]);

  const [weekResult, monthResult] = await Promise.allSettled([
    fetchVisitorCount('7d', true),
    fetchVisitorCount('30d', true)
  ]);
  renderVisitorCount('weekly-visitor-count', weekResult);
  renderVisitorCount('monthly-visitor-count', monthResult);

  for (const result of [todayResult[0], weekResult, monthResult]) {
    if (result.status === 'rejected') {
      console.warn('익명 방문 수 집계 지연:', result.reason?.message || result.reason);
    }
  }
}

document.addEventListener('daily-test-lab:locale', () => {
  document.querySelectorAll('[data-raw-value]').forEach((element) => {
    element.replaceChildren(formatStatNumber(Number(element.dataset.rawValue) || 0));
  });
});

setTodayLabel();
updateVisitStats();
setupQuiz();
setupPlayTracking();
loadDailyContent();
updateServiceStats();
updateVisitorCounts();
