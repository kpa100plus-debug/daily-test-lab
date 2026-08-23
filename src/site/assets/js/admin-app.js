import { getFirebaseServices } from './firebase-client.js';
import { signInWithGoogle, signOutMember } from './member-service.js';
import {
  DAILY_CONTENT_ACCENTS,
  createDailyContentDocument,
  normalizeDailyContent
} from './daily-content-engine.js';

const buildStep = 'REF-DAILYFUN-STEP7-ADMIN-DAILY-01';
const approvedAdminEmail = 'kpa100plus@gmail.com';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/admin-app\.js$/, '');
const dataUrls = {
  daily: new URL('../../data/daily-content.json', import.meta.url),
  tests: new URL('../../data/tests.json', import.meta.url),
  balance: new URL('../../data/balance-games.json', import.meta.url),
  games: new URL('../../data/mini-games.json', import.meta.url)
};

const root = document.querySelector('#admin-app');
let catalog = [];
let contentCounts = { tests: 0, balance: 0, games: 0 };
let currentUser = null;

document.documentElement.dataset.buildStep = buildStep;

const toSiteUrl = (route) => `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function isApprovedAdmin(user) {
  return Boolean(
    user &&
    !user.isAnonymous &&
    user.email === approvedAdminEmail &&
    user.providerData?.some((provider) => provider.providerId === 'google.com')
  );
}

async function loadContentData() {
  const responses = await Promise.all(Object.values(dataUrls).map((url) => fetch(url, { cache: 'no-store' })));
  if (responses.some((response) => !response.ok)) throw new Error('콘텐츠 데이터를 불러오지 못했습니다.');
  const [daily, tests, balance, games] = await Promise.all(responses.map((response) => response.json()));
  catalog = daily.items || [];
  contentCounts = {
    tests: (tests.items || []).filter((item) => item.status === 'published').length,
    balance: (balance.items || []).filter((item) => item.status === 'published').length,
    games: (games.items || []).filter((item) => item.status === 'published').length
  };
}

function createLoginGate(message = '') {
  const gate = element('section', 'admin-gate');
  gate.append(
    element('span', 'admin-gate-icon', '🔐'),
    element('p', 'section-kicker', 'AUTHORIZED ACCESS'),
    element('h2', '', '관리자 로그인이 필요합니다'),
    element('p', '', message || '승인된 ISEA GROUP Google 계정만 오늘의 콘텐츠를 변경할 수 있습니다.')
  );
  const login = element('button', 'member-google-button', 'Google로 관리자 로그인');
  login.type = 'button';
  const status = element('p', 'member-action-status');
  status.setAttribute('aria-live', 'polite');
  login.addEventListener('click', async () => {
    login.disabled = true;
    status.textContent = 'Google 계정 선택 창을 여는 중…';
    try {
      const user = await signInWithGoogle([]);
      if (!isApprovedAdmin(user)) {
        await signOutMember();
        login.disabled = false;
        status.textContent = '이 계정에는 관리자 권한이 없습니다.';
        return;
      }
      await initialize();
    } catch (error) {
      login.disabled = false;
      status.textContent = error?.code === 'auth/popup-closed-by-user'
        ? '로그인이 취소됐습니다.'
        : '관리자 로그인을 다시 시도해 주세요.';
    }
  });
  gate.append(login, status, element('small', '', `승인 계정: ${approvedAdminEmail}`));
  return gate;
}

function createStatCard(label, value, note) {
  const card = element('article', 'admin-stat-card');
  card.append(element('span', '', label), element('strong', '', value), element('small', '', note));
  return card;
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function fillForm(form, item) {
  for (const [key, value] of Object.entries(item || {})) {
    const fieldNode = form.elements.namedItem(key);
    if (fieldNode) fieldNode.value = value ?? '';
  }
  form.dispatchEvent(new Event('input', { bubbles: true }));
}

function renderPreview(preview, input) {
  try {
    const item = normalizeDailyContent(input);
    preview.dataset.accent = item.accent;
    preview.querySelector('[data-preview="icon"]').textContent = item.icon;
    preview.querySelector('[data-preview="category"]').textContent = `${item.category} · ${item.duration}`;
    preview.querySelector('[data-preview="title"]').textContent = item.title;
    preview.querySelector('[data-preview="description"]').textContent = item.description;
    preview.querySelector('[data-preview="action"]').textContent = item.actionLabel;
  } catch {
    // 입력 중에는 마지막으로 유효했던 미리보기를 유지합니다.
  }
}

function createPreview() {
  const preview = element('article', 'admin-content-preview');
  preview.innerHTML = `
    <span class="admin-preview-icon" data-preview="icon">✨</span>
    <small data-preview="category">오늘 추천 · 약 2분</small>
    <h3 data-preview="title">오늘의 콘텐츠</h3>
    <p data-preview="description">홈 화면에 표시될 문구를 여기서 미리 확인합니다.</p>
    <span class="admin-preview-action" data-preview="action">지금 시작</span>
  `;
  return preview;
}

function field(label, name, options = {}) {
  const wrapper = element('label', options.wide ? 'admin-field is-wide' : 'admin-field');
  wrapper.append(element('span', '', label));
  let input;
  if (options.type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = options.rows || 3;
  } else if (options.type === 'select') {
    input = document.createElement('select');
    for (const value of options.values || []) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.append(option);
    }
  } else {
    input = document.createElement('input');
    input.type = options.type || 'text';
  }
  input.name = name;
  input.required = options.required !== false;
  if (options.maxLength) input.maxLength = options.maxLength;
  if (options.placeholder) input.placeholder = options.placeholder;
  wrapper.append(input);
  return wrapper;
}

async function loadRemoteContent(services) {
  const { doc, getDoc } = services.firestoreSdk;
  const snapshot = await getDoc(doc(services.db, 'daily_contents', 'current'));
  return snapshot.exists() ? snapshot.data() : null;
}

async function createAdminDashboard(services, remoteContent) {
  const shell = element('div', 'admin-dashboard');
  const toolbar = element('section', 'admin-toolbar');
  const identity = element('div', 'admin-identity');
  identity.append(
    element('span', '', '● 관리자 인증 완료'),
    element('strong', '', currentUser.displayName || '김주영 관리자'),
    element('small', '', currentUser.email || '')
  );
  const logout = element('button', 'admin-logout', '로그아웃');
  logout.type = 'button';
  logout.addEventListener('click', async () => {
    logout.disabled = true;
    await signOutMember();
    await initialize();
  });
  toolbar.append(identity, logout);

  const stats = element('section', 'admin-stat-grid');
  stats.append(
    createStatCard('심리테스트', `${contentCounts.tests}개`, '50개 확장 구조'),
    createStatCard('밸런스 게임', `${contentCounts.balance}개`, '100개 이상 확장 구조'),
    createStatCard('미니게임', `${contentCounts.games}개`, '기록 저장 운영 중'),
    createStatCard('오늘 콘텐츠', remoteContent ? 'Firebase' : '기본값', remoteContent ? '관리자 지정 운영 중' : '정적 순환 사용 중')
  );

  const editor = element('section', 'admin-editor-section');
  const editorHeading = element('div', 'admin-section-heading');
  editorHeading.append(element('div', '', ''), element('span', 'admin-live-badge', '● 공개 홈 즉시 반영'));
  editorHeading.firstElementChild.append(
    element('p', 'section-kicker', 'DAILY CONTENT CONTROL'),
    element('h2', '', '오늘의 콘텐츠 변경')
  );

  const workspace = element('div', 'admin-editor-workspace');
  const form = element('form', 'admin-content-form');
  form.noValidate = true;

  const preset = element('label', 'admin-field is-wide admin-preset-field');
  preset.append(element('span', '', '기존 콘텐츠 불러오기'));
  const presetSelect = document.createElement('select');
  presetSelect.name = 'preset';
  catalog.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${item.icon} ${item.title}`;
    presetSelect.append(option);
  });
  preset.append(presetSelect);

  form.append(
    preset,
    field('분류', 'category', { maxLength: 40 }),
    field('노출 시간', 'duration', { maxLength: 30 }),
    field('제목', 'title', { wide: true, maxLength: 80 }),
    field('설명', 'description', { type: 'textarea', wide: true, maxLength: 180 }),
    field('버튼 문구', 'actionLabel', { maxLength: 30 }),
    field('아이콘', 'icon', { maxLength: 16 }),
    field('하단 메모', 'note', { wide: true, maxLength: 80, required: false }),
    field('연결 주소', 'route', { wide: true, maxLength: 160, placeholder: '/test/hidden-energy/' }),
    field('카드 색상', 'accent', { type: 'select', values: DAILY_CONTENT_ACCENTS })
  );

  const save = element('button', 'admin-save-button', '오늘 콘텐츠로 게시');
  save.type = 'submit';
  const status = element('p', 'admin-save-status');
  status.setAttribute('aria-live', 'polite');
  form.append(save, status);

  const previewColumn = element('div', 'admin-preview-column');
  previewColumn.append(element('p', 'section-kicker', 'LIVE PREVIEW'), createPreview());
  const preview = previewColumn.querySelector('.admin-content-preview');
  workspace.append(form, previewColumn);
  editor.append(editorHeading, workspace);

  const initialItem = remoteContent || catalog[0];
  fillForm(form, initialItem);
  presetSelect.addEventListener('change', () => fillForm(form, catalog[Number(presetSelect.value)]));
  form.addEventListener('input', () => renderPreview(preview, readForm(form)));
  renderPreview(preview, initialItem);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    save.disabled = true;
    status.className = 'admin-save-status';
    status.textContent = 'Firebase에 게시하는 중…';
    try {
      const { doc, serverTimestamp, setDoc } = services.firestoreSdk;
      const documentData = createDailyContentDocument(readForm(form), currentUser.uid, serverTimestamp());
      await setDoc(doc(services.db, 'daily_contents', 'current'), documentData);
      status.classList.add('is-success');
      status.textContent = '게시 완료 · 공개 홈페이지에 바로 반영됐습니다.';
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error?.message || '게시하지 못했습니다. 다시 시도해 주세요.';
    } finally {
      save.disabled = false;
    }
  });

  const contentLinks = element('section', 'admin-content-links');
  const contentHeading = element('div', 'admin-section-heading');
  contentHeading.append(element('div', '', ''), element('span', 'admin-next-badge', '다음 단계: 등록·수정 도구 확장'));
  contentHeading.firstElementChild.append(
    element('p', 'section-kicker', 'CONTENT STATUS'),
    element('h2', '', '전체 콘텐츠 운영 상태')
  );
  contentLinks.append(
    contentHeading,
    ...[
      ['🧠', '심리테스트 확인', '/test/'],
      ['⚖️', '밸런스 게임 확인', '/vote/'],
      ['⚡', '미니게임 확인', '/game/']
    ].map(([icon, label, route]) => {
      const link = element('a', 'admin-content-link');
      link.href = toSiteUrl(route);
      link.append(element('span', '', icon), element('strong', '', label), element('b', '', '→'));
      return link;
    })
  );

  shell.append(toolbar, stats, editor, contentLinks);
  return shell;
}

async function initialize() {
  root?.replaceChildren(element('div', 'admin-loading', '관리자 권한과 콘텐츠를 확인하고 있습니다…'));
  try {
    if (!catalog.length) await loadContentData();
    const services = await getFirebaseServices();
    if (typeof services.auth.authStateReady === 'function') await services.auth.authStateReady();
    currentUser = services.auth.currentUser;
    if (!isApprovedAdmin(currentUser)) {
      const message = currentUser && !currentUser.isAnonymous
        ? '현재 계정에는 관리자 권한이 없습니다. 승인된 계정으로 다시 로그인해 주세요.'
        : '';
      root?.replaceChildren(createLoginGate(message));
      return;
    }
    const remoteContent = await loadRemoteContent(services);
    root?.replaceChildren(await createAdminDashboard(services, remoteContent));
  } catch {
    root?.replaceChildren(createLoginGate('Firebase 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'));
  }
}

initialize();
