import { loadPublishedTests } from './content-repository.js';

const buildStep = 'REF-DAILYFUN-STEP8-CONTENT-CRUD-01';
const appUrl = new URL(import.meta.url);
const siteBasePath = appUrl.pathname.replace(/\/assets\/js\/test-list\.js$/, '');

document.documentElement.dataset.buildStep = buildStep;

const toSiteUrl = (route) => `${siteBasePath}${route.startsWith('/') ? route : `/${route}`}`;

const safeStorage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }
};

const resultHistory = safeStorage.get('daily-test-lab.test-results.v1', {});
let publishedTests = [];
let activeCategory = 'all';

function createTestCard(test) {
  const link = document.createElement('a');
  link.className = 'test-catalog-card';
  link.dataset.accent = test.accent || 'violet';
  link.href = toSiteUrl(`/test/${test.slug}/`);

  const top = document.createElement('div');
  top.className = 'test-card-top';

  const icon = document.createElement('span');
  icon.className = 'test-card-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = test.icon || '✨';

  const category = document.createElement('span');
  category.className = 'test-card-category';
  category.textContent = test.category;
  top.append(icon, category);

  const title = document.createElement('h3');
  title.textContent = test.title;

  const description = document.createElement('p');
  description.textContent = test.description;

  const bottom = document.createElement('div');
  bottom.className = 'test-card-bottom';
  const detail = document.createElement('span');
  detail.textContent = `${test.duration} · ${test.questionCount}문항`;
  const action = document.createElement('strong');
  action.textContent = '시작 →';
  bottom.append(detail, action);

  const previousResult = resultHistory[test.slug];
  if (previousResult?.resultTitle) {
    const completed = document.createElement('span');
    completed.className = 'test-completed-badge';
    completed.textContent = `내 결과 · ${previousResult.resultTitle}`;
    link.append(completed);
  }

  link.append(top, title, description, bottom);
  return link;
}

function renderTests() {
  const grid = document.querySelector('#test-grid');
  const status = document.querySelector('#catalog-status');
  if (!grid) return;

  const visibleTests = activeCategory === 'all'
    ? publishedTests
    : publishedTests.filter((test) => test.category.includes(activeCategory));

  grid.replaceChildren(...visibleTests.map(createTestCard));
  if (status) status.textContent = `${visibleTests.length}개 테스트`;
}

function setupFilters() {
  document.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category || 'all';
      document.querySelectorAll('[data-category]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      renderTests();
    });
  });
}

async function loadTests() {
  const status = document.querySelector('#catalog-status');
  try {
    publishedTests = await loadPublishedTests();
    document.querySelector('#published-test-count')?.replaceChildren(String(publishedTests.length));
    renderTests();
  } catch (error) {
    console.warn('테스트 목록을 불러오지 못했습니다.', error.message);
    document.querySelector('#test-grid')?.replaceChildren();
    if (status) status.textContent = '잠시 후 다시 시도해 주세요';
  }
}

setupFilters();
loadTests();
