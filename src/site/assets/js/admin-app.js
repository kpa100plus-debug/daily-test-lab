import { getFirebaseServices } from './firebase-client.js';
import { signInWithGoogle, signOutMember } from './member-service.js';
import {
  DAILY_CONTENT_ACCENTS,
  createDailyContentDocument,
  normalizeDailyContent
} from './daily-content-engine.js';
import {
  CONTENT_ACCENTS,
  CONTENT_STATUSES,
  createBalanceDocument,
  createBlankBalanceGame,
  createBlankTest,
  createTestDocuments,
  findAvailableSlot,
  formatScoreMapping
} from './content-admin-engine.js';

const buildStep = 'REF-DAILYFUN-STEP8-CONTENT-CRUD-01';
const approvedAdminEmail = 'kpa100plus@gmail.com';
const administratorName = 'juyoungkim';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/admin-app\.js$/, '');
const dataUrls = {
  daily: new URL('../../data/daily-content.json', import.meta.url),
  tests: new URL('../../data/tests.json', import.meta.url),
  balance: new URL('../../data/balance-games.json', import.meta.url),
  games: new URL('../../data/mini-games.json', import.meta.url)
};

const root = document.querySelector('#admin-app');
let dailyCatalog = [];
let staticTests = [];
let staticBalanceGames = [];
let miniGames = [];
let adminTests = [];
let adminBalanceGames = [];
let currentUser = null;
let firebaseServices = null;

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
    user.emailVerified &&
    user.providerData?.some((provider) => provider.providerId === 'google.com')
  );
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
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
    for (const entry of options.values || []) {
      const [value, optionLabel] = Array.isArray(entry) ? entry : [entry, entry];
      const option = document.createElement('option');
      option.value = value;
      option.textContent = optionLabel;
      input.append(option);
    }
  } else {
    input = document.createElement('input');
    input.type = options.type || 'text';
  }
  input.name = name;
  input.required = options.required !== false;
  input.value = options.value ?? '';
  input.readOnly = Boolean(options.readonly);
  if (options.maxLength) input.maxLength = options.maxLength;
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.autocomplete) input.autocomplete = options.autocomplete;
  wrapper.append(input);
  if (options.help) wrapper.append(element('small', 'admin-field-help', options.help));
  return wrapper;
}

function fillForm(form, item) {
  for (const [key, value] of Object.entries(item || {})) {
    const fieldNode = form.elements.namedItem(key);
    if (fieldNode && 'value' in fieldNode) fieldNode.value = value ?? '';
  }
  form.dispatchEvent(new Event('input', { bubbles: true }));
}

function createLoginGate(message = '') {
  const gate = element('section', 'admin-gate');
  gate.append(
    element('span', 'admin-gate-icon', '🔐'),
    element('p', 'section-kicker', 'AUTHORIZED ACCESS'),
    element('h2', '', '관리자 로그인이 필요합니다'),
    element('p', '', message || '승인된 ISEA GROUP Google 계정만 콘텐츠를 변경할 수 있습니다.')
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

async function loadStaticContent() {
  const responses = await Promise.all(Object.values(dataUrls).map((url) => fetch(url, { cache: 'no-store' })));
  if (responses.some((response) => !response.ok)) throw new Error('기본 콘텐츠 데이터를 불러오지 못했습니다.');
  const [daily, tests, balance, games] = await Promise.all(responses.map((response) => response.json()));
  dailyCatalog = daily.items || [];
  staticTests = tests.items || [];
  staticBalanceGames = balance.items || [];
  miniGames = games.items || [];
}

async function getCollectionData(collectionName) {
  try {
    const { collection, getDocs } = firebaseServices.firestoreSdk;
    const snapshot = await getDocs(collection(firebaseServices.db, collectionName));
    return snapshot.docs.map((documentSnapshot) => documentSnapshot.data());
  } catch (error) {
    console.warn(`${collectionName} 관리자 조회 지연:`, error?.message || error);
    return [];
  }
}

function mergeAdminTests(metadataItems, questionDocuments, resultDocuments) {
  const questionMap = new Map(questionDocuments.map((item) => [item.testId, item.items || []]));
  const resultMap = new Map(resultDocuments.map((item) => [item.testId, item.items || []]));
  const merged = new Map(staticTests.map((item) => [item.slug, { ...item, _source: '기본 콘텐츠' }]));
  for (const metadata of metadataItems) {
    const fallback = merged.get(metadata.slug) || {};
    merged.set(metadata.slug, {
      ...fallback,
      ...metadata,
      questions: questionMap.get(metadata.slug) || fallback.questions || [],
      results: resultMap.get(metadata.slug) || fallback.results || [],
      _source: 'Firebase'
    });
  }
  return [...merged.values()].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}

function mergeAdminBalance(remoteItems) {
  const merged = new Map(staticBalanceGames.map((item) => [item.slug, { ...item, _source: '기본 콘텐츠' }]));
  for (const item of remoteItems) merged.set(item.slug, { ...merged.get(item.slug), ...item, _source: 'Firebase' });
  return [...merged.values()].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
}

async function loadAdminCollections() {
  const [tests, questions, results, balance] = await Promise.all([
    getCollectionData('tests'),
    getCollectionData('test_questions'),
    getCollectionData('test_results'),
    getCollectionData('balance_content')
  ]);
  adminTests = mergeAdminTests(tests, questions, results);
  adminBalanceGames = mergeAdminBalance(balance);
}

async function loadRemoteDailyContent() {
  try {
    const { doc, getDoc } = firebaseServices.firestoreSdk;
    const snapshot = await getDoc(doc(firebaseServices.db, 'daily_contents', 'current'));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.warn('오늘의 콘텐츠 관리자 조회 지연:', error?.message || error);
    return null;
  }
}

function getCounts() {
  return {
    tests: adminTests.filter((item) => item.status === 'published').length,
    balance: adminBalanceGames.filter((item) => item.status === 'published').length,
    games: miniGames.filter((item) => item.status === 'published').length
  };
}

function updateStatCards() {
  const counts = getCounts();
  document.querySelector('[data-admin-stat="tests"] strong')?.replaceChildren(`${counts.tests}개`);
  document.querySelector('[data-admin-stat="balance"] strong')?.replaceChildren(`${counts.balance}개`);
}

function createStatCard(key, label, value, note) {
  const card = element('article', 'admin-stat-card');
  card.dataset.adminStat = key;
  card.append(element('span', '', label), element('strong', '', value), element('small', '', note));
  return card;
}

function createSectionHeading(kicker, title, badge, badgeClass = 'admin-live-badge') {
  const heading = element('div', 'admin-section-heading');
  const textColumn = element('div');
  textColumn.append(element('p', 'section-kicker', kicker), element('h2', '', title));
  heading.append(textColumn, element('span', badgeClass, badge));
  return heading;
}

function setSaveStatus(statusNode, message, type = '') {
  statusNode.className = 'admin-save-status';
  if (type) statusNode.classList.add(`is-${type}`);
  statusNode.textContent = message;
}

function renderDailyPreview(preview, input) {
  try {
    const item = normalizeDailyContent(input);
    preview.dataset.accent = item.accent;
    preview.querySelector('[data-preview="icon"]').textContent = item.icon;
    preview.querySelector('[data-preview="category"]').textContent = `${item.category} · ${item.duration}`;
    preview.querySelector('[data-preview="title"]').textContent = item.title;
    preview.querySelector('[data-preview="description"]').textContent = item.description;
    preview.querySelector('[data-preview="action"]').textContent = item.actionLabel;
  } catch {
    // 입력 중에는 마지막 유효 미리보기를 유지합니다.
  }
}

function createDailyPreview() {
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

function createDailyEditor(remoteContent) {
  const editor = element('section', 'admin-editor-section admin-panel');
  editor.dataset.adminPanel = 'daily';
  editor.append(createSectionHeading('DAILY CONTENT CONTROL', '오늘의 콘텐츠 변경', '● 공개 홈 즉시 반영'));
  const workspace = element('div', 'admin-editor-workspace');
  const form = element('form', 'admin-content-form');
  form.noValidate = true;
  const preset = field('기존 콘텐츠 불러오기', 'preset', {
    type: 'select', wide: true,
    values: dailyCatalog.map((item, index) => [String(index), `${item.icon} ${item.title}`])
  });
  preset.classList.add('admin-preset-field');
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
  const preview = createDailyPreview();
  previewColumn.append(element('p', 'section-kicker', 'LIVE PREVIEW'), preview);
  workspace.append(form, previewColumn);
  editor.append(workspace);
  const initialItem = remoteContent || dailyCatalog[0];
  fillForm(form, initialItem);
  preset.querySelector('select').addEventListener('change', (event) => fillForm(form, dailyCatalog[Number(event.target.value)]));
  form.addEventListener('input', () => renderDailyPreview(preview, readForm(form)));
  renderDailyPreview(preview, initialItem);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    save.disabled = true;
    setSaveStatus(status, 'Firebase에 게시하는 중…');
    try {
      const { doc, serverTimestamp, setDoc } = firebaseServices.firestoreSdk;
      const documentData = createDailyContentDocument(readForm(form), currentUser.uid, serverTimestamp());
      await setDoc(doc(firebaseServices.db, 'daily_contents', 'current'), documentData);
      setSaveStatus(status, '게시 완료 · 공개 홈페이지에 바로 반영됐습니다.', 'success');
    } catch (error) {
      setSaveStatus(status, error?.message || '게시하지 못했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      save.disabled = false;
    }
  });
  return editor;
}

function readQuestionCards(host) {
  return [...host.querySelectorAll('.admin-question-card')].map((card) => ({
    id: card.querySelector('[data-question-field="id"]').value,
    text: card.querySelector('[data-question-field="text"]').value,
    options: [...card.querySelectorAll('.admin-option-row')].map((row) => ({
      id: row.querySelector('[data-option-field="id"]').value,
      text: row.querySelector('[data-option-field="text"]').value,
      scores: row.querySelector('[data-option-field="scores"]').value
    }))
  }));
}

function createCompactInput(value, label, dataAttribute, options = {}) {
  const wrapper = element('label', options.className || 'admin-compact-field');
  wrapper.append(element('span', '', label));
  const input = options.textarea ? document.createElement('textarea') : document.createElement('input');
  input.value = value ?? '';
  input.dataset[dataAttribute] = options.key;
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.maxLength) input.maxLength = options.maxLength;
  if (options.textarea) input.rows = options.rows || 2;
  wrapper.append(input);
  return wrapper;
}

function renderQuestionCards(host, questions) {
  const rerender = (nextQuestions) => renderQuestionCards(host, nextQuestions);
  host.replaceChildren(...questions.map((question, questionIndex) => {
    const card = element('article', 'admin-question-card');
    const top = element('div', 'admin-card-heading');
    top.append(element('strong', '', `질문 ${questionIndex + 1}`));
    const remove = element('button', 'admin-remove-button', '질문 삭제');
    remove.type = 'button';
    remove.disabled = questions.length <= 1;
    remove.addEventListener('click', () => {
      const next = readQuestionCards(host);
      next.splice(questionIndex, 1);
      rerender(next);
    });
    top.append(remove);
    const baseFields = element('div', 'admin-compact-grid');
    baseFields.append(
      createCompactInput(question.id, '질문 ID', 'questionField', { key: 'id' }),
      createCompactInput(question.text, '질문 문장', 'questionField', { key: 'text', className: 'admin-compact-field is-wide' })
    );
    const optionHost = element('div', 'admin-option-list');
    (question.options || []).forEach((option, optionIndex) => {
      const row = element('div', 'admin-option-row');
      row.append(
        createCompactInput(option.id, 'ID', 'optionField', { key: 'id' }),
        createCompactInput(option.text, `선택지 ${optionIndex + 1}`, 'optionField', { key: 'text' }),
        createCompactInput(formatScoreMapping(option.scores), '결과 점수', 'optionField', { key: 'scores', placeholder: 'type-a:2, type-b:1' })
      );
      const removeOption = element('button', 'admin-row-remove', '×');
      removeOption.type = 'button';
      removeOption.title = '선택지 삭제';
      removeOption.disabled = (question.options || []).length <= 2;
      removeOption.addEventListener('click', () => {
        const next = readQuestionCards(host);
        next[questionIndex].options.splice(optionIndex, 1);
        rerender(next);
      });
      row.append(removeOption);
      optionHost.append(row);
    });
    const addOption = element('button', 'admin-add-row-button', '+ 선택지 추가');
    addOption.type = 'button';
    addOption.disabled = (question.options || []).length >= 5;
    addOption.addEventListener('click', () => {
      const next = readQuestionCards(host);
      const optionIndex = next[questionIndex].options.length;
      const firstScoreId = String(next[questionIndex].options[0]?.scores || 'type-a:1').split(/[:,]/)[0].trim() || 'type-a';
      next[questionIndex].options.push({ id: String.fromCharCode(97 + optionIndex), text: '새 선택지', scores: `${firstScoreId}:1` });
      rerender(next);
    });
    card.append(top, baseFields, optionHost, addOption);
    return card;
  }));
}

function readResultCards(host) {
  return [...host.querySelectorAll('.admin-result-card')].map((card) => ({
    id: card.querySelector('[data-result-field="id"]').value,
    emoji: card.querySelector('[data-result-field="emoji"]').value,
    label: card.querySelector('[data-result-field="label"]').value,
    title: card.querySelector('[data-result-field="title"]').value,
    summary: card.querySelector('[data-result-field="summary"]').value,
    description: card.querySelector('[data-result-field="description"]').value,
    traits: card.querySelector('[data-result-field="traits"]').value,
    tips: card.querySelector('[data-result-field="tips"]').value,
    shareText: card.querySelector('[data-result-field="shareText"]').value
  }));
}

function renderResultCards(host, results) {
  const rerender = (nextResults) => renderResultCards(host, nextResults);
  host.replaceChildren(...results.map((result, resultIndex) => {
    const card = element('article', 'admin-result-card');
    const top = element('div', 'admin-card-heading');
    top.append(element('strong', '', `결과 ${resultIndex + 1}`));
    const remove = element('button', 'admin-remove-button', '결과 삭제');
    remove.type = 'button';
    remove.disabled = results.length <= 2;
    remove.addEventListener('click', () => {
      const next = readResultCards(host);
      next.splice(resultIndex, 1);
      rerender(next);
    });
    top.append(remove);
    const grid = element('div', 'admin-compact-grid');
    grid.append(
      createCompactInput(result.id, '결과 ID', 'resultField', { key: 'id' }),
      createCompactInput(result.emoji, '아이콘', 'resultField', { key: 'emoji' }),
      createCompactInput(result.label, '영문 라벨', 'resultField', { key: 'label' }),
      createCompactInput(result.title, '결과 제목', 'resultField', { key: 'title' }),
      createCompactInput(result.summary, '한 줄 요약', 'resultField', { key: 'summary', className: 'admin-compact-field is-wide' }),
      createCompactInput(result.description, '상세 설명', 'resultField', { key: 'description', textarea: true, className: 'admin-compact-field is-wide' }),
      createCompactInput(Array.isArray(result.traits) ? result.traits.join('\n') : result.traits, '특징 · 줄바꿈 구분', 'resultField', { key: 'traits', textarea: true }),
      createCompactInput(Array.isArray(result.tips) ? result.tips.join('\n') : result.tips, '활용 팁 · 줄바꿈 구분', 'resultField', { key: 'tips', textarea: true }),
      createCompactInput(result.shareText, '공유 문구', 'resultField', { key: 'shareText', className: 'admin-compact-field is-wide' })
    );
    card.append(top, grid);
    return card;
  }));
}

function readTestEditor(form, questionsHost, resultsHost) {
  const values = readForm(form);
  return {
    id: values.id, slug: values.slug, status: values.status, category: values.category,
    icon: values.icon, accent: values.accent, title: values.title, shortTitle: values.shortTitle,
    description: values.description, duration: values.duration, participantLabel: values.participantLabel,
    disclaimer: values.disclaimer, seo: { title: values.seoTitle, description: values.seoDescription },
    recommendations: values.recommendations, questions: readQuestionCards(questionsHost), results: readResultCards(resultsHost)
  };
}

function testOptionLabel(item) {
  const status = { published: '공개', draft: '초안', archived: '보관' }[item.status] || item.status;
  return `${item.icon || '🧠'} ${item.title} · ${status}`;
}

function balanceOptionLabel(item) {
  const status = { published: '공개', draft: '초안', archived: '보관' }[item.status] || item.status;
  return `${item.icon || '⚖️'} ${item.title} · ${status}`;
}

function populateManagerSelect(select, items, selectedSlug, labeler) {
  select.replaceChildren(...items.map((item) => {
    const option = document.createElement('option');
    option.value = item.slug;
    option.textContent = labeler(item);
    option.selected = item.slug === selectedSlug;
    return option;
  }));
}

function updateTestCatalog(item) {
  adminTests = adminTests.filter((candidate) => candidate.slug !== item.slug);
  adminTests.push({ ...item, _source: 'Firebase' });
  adminTests.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  updateStatCards();
}

function createTestManager() {
  const section = element('section', 'admin-editor-section admin-panel');
  section.dataset.adminPanel = 'tests';
  section.hidden = true;
  section.append(createSectionHeading('TEST · QUESTION · RESULT CRUD', '심리테스트 통합 관리', '50개 슬롯 준비', 'admin-next-badge'));
  const toolbar = element('div', 'admin-manager-toolbar');
  const select = document.createElement('select');
  select.setAttribute('aria-label', '관리할 심리테스트');
  const createButton = element('button', 'admin-create-button', '+ 새 테스트');
  createButton.type = 'button';
  toolbar.append(select, createButton);
  const mount = element('div', 'admin-crud-mount');
  section.append(toolbar, mount);

  function renderEditor(item) {
    mount.replaceChildren();
    const form = element('form', 'admin-crud-form');
    form.noValidate = true;
    const sourceLine = element('div', 'admin-source-line');
    sourceLine.append(
      element('span', `admin-status-chip is-${item.status}`, item.status === 'published' ? '공개' : item.status === 'archived' ? '보관됨' : '초안'),
      element('small', '', `${item._source || '새 콘텐츠'} · 주소는 등록 후 변경되지 않습니다.`)
    );
    form.append(sourceLine);
    const meta = element('div', 'admin-content-form admin-crud-meta');
    meta.append(
      field('콘텐츠 ID', 'id', { value: item.id, readonly: true }),
      field('등록 슬롯', 'slug', { value: item.slug, readonly: true }),
      field('현재 상태', 'status', { type: 'select', values: CONTENT_STATUSES, value: item.status }),
      field('분류', 'category', { value: item.category, maxLength: 40 }),
      field('아이콘', 'icon', { value: item.icon, maxLength: 16 }),
      field('카드 색상', 'accent', { type: 'select', values: CONTENT_ACCENTS, value: item.accent }),
      field('테스트 제목', 'title', { value: item.title, wide: true, maxLength: 100 }),
      field('짧은 제목', 'shortTitle', { value: item.shortTitle, maxLength: 50 }),
      field('소요 시간', 'duration', { value: item.duration, maxLength: 30 }),
      field('설명', 'description', { type: 'textarea', value: item.description, wide: true, maxLength: 240 }),
      field('참여 문구', 'participantLabel', { value: item.participantLabel, wide: true, maxLength: 60 }),
      field('결과 안내 문구', 'disclaimer', { type: 'textarea', value: item.disclaimer, wide: true, maxLength: 240 }),
      field('SEO 제목', 'seoTitle', { value: item.seo?.title, wide: true, maxLength: 120 }),
      field('SEO 설명', 'seoDescription', { type: 'textarea', value: item.seo?.description, wide: true, maxLength: 200 }),
      field('추천 테스트 슬롯 · 쉼표 구분', 'recommendations', { value: (item.recommendations || []).join(', '), wide: true, required: false, placeholder: 'hidden-energy, friend-view' })
    );
    form.append(meta);

    const questionsBlock = element('section', 'admin-nested-section');
    const questionHeading = element('div', 'admin-nested-heading');
    questionHeading.append(element('div', '', '질문과 선택지'));
    const addQuestion = element('button', 'admin-add-button', '+ 질문 추가');
    addQuestion.type = 'button';
    questionHeading.append(addQuestion);
    const questionsHost = element('div', 'admin-card-list');
    renderQuestionCards(questionsHost, item.questions || []);
    addQuestion.addEventListener('click', () => {
      const next = readQuestionCards(questionsHost);
      const resultIds = readResultCards(resultsHost).map((result) => result.id).filter(Boolean);
      const firstResultId = resultIds[0] || 'type-a';
      const secondResultId = resultIds[1] || firstResultId;
      next.push({
        id: `${item.slug}-q${next.length + 1}`, text: '새 질문을 입력해 주세요.',
        options: [{ id: 'a', text: '첫 번째 선택지', scores: `${firstResultId}:2` }, { id: 'b', text: '두 번째 선택지', scores: `${secondResultId}:2` }]
      });
      renderQuestionCards(questionsHost, next);
    });
    questionsBlock.append(questionHeading, questionsHost);

    const resultsBlock = element('section', 'admin-nested-section');
    const resultHeading = element('div', 'admin-nested-heading');
    resultHeading.append(element('div', '', '결과 유형'));
    const addResult = element('button', 'admin-add-button', '+ 결과 추가');
    addResult.type = 'button';
    resultHeading.append(addResult);
    const resultsHost = element('div', 'admin-card-list');
    renderResultCards(resultsHost, item.results || []);
    addResult.addEventListener('click', () => {
      const next = readResultCards(resultsHost);
      const number = next.length + 1;
      next.push({
        id: `type-${number}`, emoji: '✨', label: `TYPE ${number}`, title: `결과 ${number}`,
        summary: '결과를 한 줄로 요약해 주세요.', description: '결과에 대한 자세한 설명을 입력해 주세요.',
        traits: '대표 특징 1\n대표 특징 2\n대표 특징 3', tips: '활용 팁을 입력해 주세요.',
        shareText: '나의 결과를 확인했어요! 당신의 결과는?'
      });
      renderResultCards(resultsHost, next);
    });
    resultsBlock.append(resultHeading, resultsHost);

    const actions = element('div', 'admin-crud-actions');
    const saveDraft = element('button', 'admin-secondary-action', '초안 저장');
    const publish = element('button', 'admin-primary-action', '저장 후 공개');
    const archive = element('button', 'admin-danger-action', '삭제 대신 보관');
    const preview = element('a', 'admin-preview-link', '공개 주소 확인 ↗');
    [saveDraft, publish, archive].forEach((button) => { button.type = 'button'; });
    preview.href = toSiteUrl(`/test/${item.slug}/`);
    preview.target = '_blank';
    preview.rel = 'noopener';
    actions.append(saveDraft, publish, archive, preview);
    const status = element('p', 'admin-save-status');
    status.setAttribute('aria-live', 'polite');
    form.append(questionsBlock, resultsBlock, actions, status);
    mount.append(form);

    async function persist(requestedStatus) {
      const buttons = [saveDraft, publish, archive];
      buttons.forEach((button) => { button.disabled = true; });
      setSaveStatus(status, requestedStatus === 'published' ? '검증 후 공개하는 중…' : 'Firebase에 저장하는 중…');
      try {
        const { doc, serverTimestamp, writeBatch } = firebaseServices.firestoreSdk;
        const documents = createTestDocuments(readTestEditor(form, questionsHost, resultsHost), requestedStatus, currentUser.uid, serverTimestamp());
        const batch = writeBatch(firebaseServices.db);
        batch.set(doc(firebaseServices.db, 'tests', item.slug), documents.metadata);
        batch.set(doc(firebaseServices.db, 'test_questions', item.slug), documents.questions);
        batch.set(doc(firebaseServices.db, 'test_results', item.slug), documents.results);
        await batch.commit();
        const nextItem = { ...documents.metadata, questions: documents.questions.items, results: documents.results.items, _source: 'Firebase' };
        updateTestCatalog(nextItem);
        populateManagerSelect(select, adminTests, item.slug, testOptionLabel);
        setSaveStatus(status,
          requestedStatus === 'published' ? '공개 완료 · 목록과 전용 주소에 바로 반영됩니다.'
            : requestedStatus === 'archived' ? '보관 완료 · 공개 목록에서 안전하게 숨겼습니다.'
              : '초안 저장 완료 · 방문자에게는 아직 보이지 않습니다.', 'success');
        sourceLine.querySelector('span').className = `admin-status-chip is-${requestedStatus}`;
        sourceLine.querySelector('span').textContent = requestedStatus === 'published' ? '공개' : requestedStatus === 'archived' ? '보관됨' : '초안';
        form.elements.status.value = requestedStatus;
      } catch (error) {
        setSaveStatus(status, error?.message || '저장하지 못했습니다. 입력값을 확인해 주세요.', 'error');
      } finally {
        buttons.forEach((button) => { button.disabled = false; });
      }
    }
    saveDraft.addEventListener('click', () => persist('draft'));
    publish.addEventListener('click', () => persist('published'));
    archive.addEventListener('click', () => {
      if (window.confirm('이 테스트를 공개 목록에서 숨기고 보관할까요? 콘텐츠와 주소는 복구할 수 있습니다.')) persist('archived');
    });
  }

  populateManagerSelect(select, adminTests, adminTests[0]?.slug, testOptionLabel);
  if (adminTests[0]) renderEditor(adminTests[0]);
  select.addEventListener('change', () => {
    const selected = adminTests.find((item) => item.slug === select.value);
    if (selected) renderEditor(selected);
  });
  createButton.addEventListener('click', () => {
    try {
      const slot = findAvailableSlot('test', adminTests.map((item) => item.slug));
      const blank = { ...createBlankTest(slot), _source: '새 콘텐츠' };
      adminTests.unshift(blank);
      populateManagerSelect(select, adminTests, blank.slug, testOptionLabel);
      renderEditor(blank);
    } catch (error) {
      mount.replaceChildren(element('p', 'admin-inline-error', error.message));
    }
  });
  return section;
}

function readBalanceEditor(form) {
  const values = readForm(form);
  return {
    id: values.id, slug: values.slug, status: values.status, category: values.category, icon: values.icon,
    title: values.title, question: values.question, description: values.description,
    options: [
      { id: 'a', label: values.optionALabel, shortLabel: values.optionAShort, emoji: values.optionAEmoji },
      { id: 'b', label: values.optionBLabel, shortLabel: values.optionBShort, emoji: values.optionBEmoji }
    ],
    shareText: values.shareText, seo: { title: values.seoTitle, description: values.seoDescription }
  };
}

function updateBalanceCatalog(item) {
  adminBalanceGames = adminBalanceGames.filter((candidate) => candidate.slug !== item.slug);
  adminBalanceGames.push({ ...item, _source: 'Firebase' });
  adminBalanceGames.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
  updateStatCards();
}

function createBalanceManager() {
  const section = element('section', 'admin-editor-section admin-panel');
  section.dataset.adminPanel = 'balance';
  section.hidden = true;
  section.append(createSectionHeading('BALANCE CONTENT CRUD', '밸런스게임 통합 관리', '120개 슬롯 준비', 'admin-next-badge'));
  const toolbar = element('div', 'admin-manager-toolbar');
  const select = document.createElement('select');
  select.setAttribute('aria-label', '관리할 밸런스게임');
  const createButton = element('button', 'admin-create-button', '+ 새 밸런스');
  createButton.type = 'button';
  toolbar.append(select, createButton);
  const mount = element('div', 'admin-crud-mount');
  section.append(toolbar, mount);

  function renderEditor(item) {
    mount.replaceChildren();
    const form = element('form', 'admin-content-form admin-balance-form');
    form.noValidate = true;
    const sourceLine = element('div', 'admin-source-line is-wide');
    sourceLine.append(
      element('span', `admin-status-chip is-${item.status}`, item.status === 'published' ? '공개' : item.status === 'archived' ? '보관됨' : '초안'),
      element('small', '', `${item._source || '새 콘텐츠'} · 투표 통계와 분리되어 안전하게 수정됩니다.`)
    );
    form.append(
      sourceLine,
      field('콘텐츠 ID', 'id', { value: item.id, readonly: true }),
      field('등록 슬롯', 'slug', { value: item.slug, readonly: true }),
      field('현재 상태', 'status', { type: 'select', values: CONTENT_STATUSES, value: item.status }),
      field('분류', 'category', { value: item.category, maxLength: 40 }),
      field('아이콘', 'icon', { value: item.icon, maxLength: 16 }),
      field('관리 제목', 'title', { value: item.title, maxLength: 100 }),
      field('질문', 'question', { type: 'textarea', value: item.question, wide: true, maxLength: 180 }),
      field('상황 설명', 'description', { type: 'textarea', value: item.description, wide: true, maxLength: 240 }),
      field('A 선택지', 'optionALabel', { value: item.options?.[0]?.label, maxLength: 100 }),
      field('A 짧은 문구', 'optionAShort', { value: item.options?.[0]?.shortLabel, maxLength: 40 }),
      field('A 아이콘', 'optionAEmoji', { value: item.options?.[0]?.emoji, maxLength: 16 }),
      field('B 선택지', 'optionBLabel', { value: item.options?.[1]?.label, maxLength: 100 }),
      field('B 짧은 문구', 'optionBShort', { value: item.options?.[1]?.shortLabel, maxLength: 40 }),
      field('B 아이콘', 'optionBEmoji', { value: item.options?.[1]?.emoji, maxLength: 16 }),
      field('공유 문구', 'shareText', { type: 'textarea', value: item.shareText, wide: true, maxLength: 180 }),
      field('SEO 제목', 'seoTitle', { value: item.seo?.title, wide: true, maxLength: 120 }),
      field('SEO 설명', 'seoDescription', { type: 'textarea', value: item.seo?.description, wide: true, maxLength: 200 })
    );
    const actions = element('div', 'admin-crud-actions is-wide');
    const saveDraft = element('button', 'admin-secondary-action', '초안 저장');
    const publish = element('button', 'admin-primary-action', '저장 후 공개');
    const archive = element('button', 'admin-danger-action', '삭제 대신 보관');
    const preview = element('a', 'admin-preview-link', '공개 주소 확인 ↗');
    [saveDraft, publish, archive].forEach((button) => { button.type = 'button'; });
    preview.href = toSiteUrl(`/vote/${item.slug}/`);
    preview.target = '_blank';
    preview.rel = 'noopener';
    actions.append(saveDraft, publish, archive, preview);
    const status = element('p', 'admin-save-status is-wide');
    status.setAttribute('aria-live', 'polite');
    form.append(actions, status);
    mount.append(form);

    async function persist(requestedStatus) {
      const buttons = [saveDraft, publish, archive];
      buttons.forEach((button) => { button.disabled = true; });
      setSaveStatus(status, requestedStatus === 'published' ? '검증 후 공개하는 중…' : 'Firebase에 저장하는 중…');
      try {
        const { doc, serverTimestamp, setDoc } = firebaseServices.firestoreSdk;
        const documentData = createBalanceDocument(readBalanceEditor(form), requestedStatus, currentUser.uid, serverTimestamp());
        await setDoc(doc(firebaseServices.db, 'balance_content', item.slug), documentData);
        updateBalanceCatalog(documentData);
        populateManagerSelect(select, adminBalanceGames, item.slug, balanceOptionLabel);
        setSaveStatus(status,
          requestedStatus === 'published' ? '공개 완료 · 기존 투표 수를 유지한 채 콘텐츠만 반영했습니다.'
            : requestedStatus === 'archived' ? '보관 완료 · 공개 목록에서 안전하게 숨겼습니다.'
              : '초안 저장 완료 · 방문자에게는 아직 보이지 않습니다.', 'success');
        sourceLine.querySelector('span').className = `admin-status-chip is-${requestedStatus}`;
        sourceLine.querySelector('span').textContent = requestedStatus === 'published' ? '공개' : requestedStatus === 'archived' ? '보관됨' : '초안';
        form.elements.status.value = requestedStatus;
      } catch (error) {
        setSaveStatus(status, error?.message || '저장하지 못했습니다. 입력값을 확인해 주세요.', 'error');
      } finally {
        buttons.forEach((button) => { button.disabled = false; });
      }
    }
    saveDraft.addEventListener('click', () => persist('draft'));
    publish.addEventListener('click', () => persist('published'));
    archive.addEventListener('click', () => {
      if (window.confirm('이 밸런스게임을 공개 목록에서 숨기고 보관할까요? 누적 투표 수는 유지됩니다.')) persist('archived');
    });
  }

  populateManagerSelect(select, adminBalanceGames, adminBalanceGames[0]?.slug, balanceOptionLabel);
  if (adminBalanceGames[0]) renderEditor(adminBalanceGames[0]);
  select.addEventListener('change', () => {
    const selected = adminBalanceGames.find((item) => item.slug === select.value);
    if (selected) renderEditor(selected);
  });
  createButton.addEventListener('click', () => {
    try {
      const slot = findAvailableSlot('balance', adminBalanceGames.map((item) => item.slug));
      const blank = { ...createBlankBalanceGame(slot), _source: '새 콘텐츠' };
      adminBalanceGames.unshift(blank);
      populateManagerSelect(select, adminBalanceGames, blank.slug, balanceOptionLabel);
      renderEditor(blank);
    } catch (error) {
      mount.replaceChildren(element('p', 'admin-inline-error', error.message));
    }
  });
  return section;
}

function createTabNavigation(panels) {
  const navigation = element('nav', 'admin-tabs');
  navigation.setAttribute('aria-label', '관리 기능');
  const labels = { daily: ['✨', '오늘 콘텐츠'], tests: ['🧠', '심리테스트'], balance: ['⚖️', '밸런스게임'] };
  Object.entries(panels).forEach(([key, panel], index) => {
    const button = element('button', index === 0 ? 'active' : '', `${labels[key][0]} ${labels[key][1]}`);
    button.type = 'button';
    button.dataset.adminTab = key;
    button.setAttribute('aria-controls', `admin-panel-${key}`);
    panel.id = `admin-panel-${key}`;
    button.addEventListener('click', () => {
      navigation.querySelectorAll('button').forEach((tab) => tab.classList.toggle('active', tab === button));
      Object.values(panels).forEach((candidate) => { candidate.hidden = candidate !== panel; });
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    navigation.append(button);
  });
  return navigation;
}

async function createAdminDashboard(remoteDailyContent) {
  const shell = element('div', 'admin-dashboard');
  const toolbar = element('section', 'admin-toolbar');
  const identity = element('div', 'admin-identity');
  identity.append(element('span', '', '● 관리자 인증 완료'), element('strong', '', administratorName), element('small', '', currentUser.email || ''));
  const logout = element('button', 'admin-logout', '로그아웃');
  logout.type = 'button';
  logout.addEventListener('click', async () => { logout.disabled = true; await signOutMember(); await initialize(); });
  toolbar.append(identity, logout);
  const counts = getCounts();
  const stats = element('section', 'admin-stat-grid');
  stats.append(
    createStatCard('tests', '심리테스트', `${counts.tests}개`, '50개 관리자 슬롯'),
    createStatCard('balance', '밸런스 게임', `${counts.balance}개`, '120개 관리자 슬롯'),
    createStatCard('games', '미니게임', `${counts.games}개`, '기록 저장 운영 중'),
    createStatCard('daily', '오늘 콘텐츠', remoteDailyContent ? 'Firebase' : '기본값', remoteDailyContent ? '관리자 지정 운영 중' : '정적 순환 사용 중')
  );
  const panels = { daily: createDailyEditor(remoteDailyContent), tests: createTestManager(), balance: createBalanceManager() };
  const tabs = createTabNavigation(panels);
  const contentLinks = element('section', 'admin-content-links');
  contentLinks.append(
    createSectionHeading('PUBLIC CHECK', '공개 서비스 확인', '콘텐츠 저장 후 확인', 'admin-next-badge'),
    ...[
      ['🧠', '심리테스트 확인', '/test/'], ['⚖️', '밸런스 게임 확인', '/vote/'], ['⚡', '미니게임 확인', '/game/']
    ].map(([icon, label, route]) => {
      const link = element('a', 'admin-content-link');
      link.href = toSiteUrl(route);
      link.append(element('span', '', icon), element('strong', '', label), element('b', '', '→'));
      return link;
    })
  );
  shell.append(toolbar, stats, tabs, ...Object.values(panels), contentLinks);
  return shell;
}

async function initialize() {
  root?.replaceChildren(element('div', 'admin-loading', '관리자 권한과 콘텐츠를 확인하고 있습니다…'));
  try {
    if (!dailyCatalog.length) await loadStaticContent();
    firebaseServices = await getFirebaseServices();
    if (typeof firebaseServices.auth.authStateReady === 'function') await firebaseServices.auth.authStateReady();
    currentUser = firebaseServices.auth.currentUser;
    if (!isApprovedAdmin(currentUser)) {
      const message = currentUser && !currentUser.isAnonymous ? '현재 계정에는 관리자 권한이 없습니다. 승인된 계정으로 다시 로그인해 주세요.' : '';
      root?.replaceChildren(createLoginGate(message));
      return;
    }
    const [remoteDailyContent] = await Promise.all([loadRemoteDailyContent(), loadAdminCollections()]);
    root?.replaceChildren(await createAdminDashboard(remoteDailyContent));
  } catch (error) {
    console.warn('관리자 화면 초기화 오류:', error?.message || error);
    root?.replaceChildren(createLoginGate('Firebase 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'));
  }
}

initialize();
