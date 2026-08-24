import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('./Code.gs', import.meta.url), 'utf8');
const manifest = {
  schemaVersion: 1,
  revision: 'test.1',
  blogId: '5587300283797440679',
  pages: [
    {
      key: 'about',
      title: 'About',
      enabled: true,
      isDraft: false,
      content: '<p>This is a sufficiently detailed test page for the sync harness.</p>',
    },
  ],
  posts: [
    {
      key: 'welcome',
      title: 'Welcome',
      enabled: true,
      isDraft: false,
      labels: ['DAILY TEST LAB'],
      content: '<p>This is a sufficiently detailed test post for the sync harness.</p>',
    },
  ],
};

const resources = { pages: [], posts: [] };
const properties = new Map();
const triggers = [];

class MockResponse {
  constructor(code, body) {
    this.code = code;
    this.body = body === undefined ? '' : JSON.stringify(body);
  }
  getResponseCode() {
    return this.code;
  }
  getContentText() {
    return this.body;
  }
}

function apiResponse(url, request) {
  if (url.includes('raw.githubusercontent.com')) {
    return new MockResponse(200, manifest);
  }

  const parsed = new URL(url);
  const path = parsed.pathname;
  const method = String(request.method || 'get').toLowerCase();

  if (path.endsWith('/blogs/5587300283797440679')) {
    return new MockResponse(200, {
      id: '5587300283797440679',
      name: 'DAILY TEST LAB',
      url: 'https://dailytestlabkr.blogspot.com/',
    });
  }

  for (const resourceName of ['pages', 'posts']) {
    const collectionPath = `/blogger/v3/blogs/5587300283797440679/${resourceName}`;
    if (path === collectionPath && method === 'get') {
      return new MockResponse(200, { items: resources[resourceName] });
    }
    if (path === collectionPath && method === 'post') {
      const body = JSON.parse(request.payload);
      const created = {
        ...body,
        id: `${resourceName}-${resources[resourceName].length + 1}`,
      };
      resources[resourceName].push(created);
      return new MockResponse(200, created);
    }

    const itemMatch = path.match(
      new RegExp(`${collectionPath}/([^/]+)$`)
    );
    if (itemMatch && method === 'get') {
      const found = resources[resourceName].find((item) => item.id === itemMatch[1]);
      return found ? new MockResponse(200, found) : new MockResponse(404, { error: 'missing' });
    }
    if (itemMatch && method === 'patch') {
      const index = resources[resourceName].findIndex((item) => item.id === itemMatch[1]);
      if (index < 0) return new MockResponse(404, { error: 'missing' });
      resources[resourceName][index] = {
        ...resources[resourceName][index],
        ...JSON.parse(request.payload),
      };
      return new MockResponse(200, resources[resourceName][index]);
    }
  }

  return new MockResponse(500, { error: `Unhandled mock route: ${method} ${path}` });
}

const scriptProperties = {
  getProperty: (key) => properties.get(key) || null,
  setProperty: (key, value) => properties.set(key, String(value)),
  deleteProperty: (key) => properties.delete(key),
};

const context = vm.createContext({
  console: { log() {} },
  Date,
  JSON,
  Math,
  Object,
  String,
  Array,
  RegExp,
  Error,
  encodeURIComponent,
  UrlFetchApp: { fetch: apiResponse },
  Utilities: { sleep() {} },
  LockService: {
    getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }),
  },
  PropertiesService: { getScriptProperties: () => scriptProperties },
  ScriptApp: {
    getOAuthToken: () => 'test-token',
    getProjectTriggers: () => triggers,
    deleteTrigger: (trigger) => {
      const index = triggers.indexOf(trigger);
      if (index >= 0) triggers.splice(index, 1);
    },
    newTrigger: (handler) => ({
      timeBased() {
        return this;
      },
      everyHours(hours) {
        this.hours = hours;
        return this;
      },
      create() {
        triggers.push({
          handler,
          hours: this.hours,
          getHandlerFunction: () => handler,
        });
      },
    }),
  },
});

vm.runInContext(
  `${source}\n;globalThis.__dtlTest = { setupDailyTestLabBlogger, syncDailyTestLabBlogger, getDailyTestLabBloggerSyncStatus };`,
  context,
  { filename: 'Code.gs' }
);

const first = context.__dtlTest.setupDailyTestLabBlogger();
assert.deepEqual(JSON.parse(JSON.stringify(first.pages)), {
  created: 1,
  updated: 0,
  skipped: 0,
});
assert.deepEqual(JSON.parse(JSON.stringify(first.posts)), {
  created: 1,
  updated: 0,
  skipped: 0,
});
assert.equal(resources.pages.length, 1);
assert.equal(resources.posts.length, 1);
assert.equal(triggers.length, 1);
assert.equal(triggers[0].hours, 6);

manifest.revision = 'test.2';
manifest.pages[0].content = '<p>Updated test page content that remains long enough for validation.</p>';
const second = context.__dtlTest.syncDailyTestLabBlogger();
assert.equal(second.pages.created, 0);
assert.equal(second.pages.updated, 1);
assert.equal(second.posts.created, 0);
assert.equal(second.posts.updated, 1);
assert.equal(resources.pages.length, 1, 'page sync must not create duplicates');
assert.equal(resources.posts.length, 1, 'post sync must not create duplicates');

const status = context.__dtlTest.getDailyTestLabBloggerSyncStatus();
assert.equal(status.triggerCount, 1);
assert.equal(status.lastSync.revision, 'test.2');

console.log('Blogger sync harness OK: create, update, trigger, and duplicate prevention');
