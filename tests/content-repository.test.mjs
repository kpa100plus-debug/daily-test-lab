import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const sourceUrl = new URL('../src/site/assets/js/content-repository.js', import.meta.url);
const source = (await readFile(sourceUrl, 'utf8'))
  .replace(/^import .*;\n/gm, '')
  .replaceAll('import.meta.url', JSON.stringify(sourceUrl.href))
  .replace(/^export /gm, '');
const published = { slug: 'example', status: 'published', title: 'Static title' };
const response = (items = [published]) => ({ ok: true, json: async () => ({ items }) });

function repository({ fetch = async () => response(), getDocs = async () => ({ docs: [] }) } = {}) {
  return runInNewContext(`${source}\n({ loadPublishedTests, loadPublishedBalanceGames, loadTestBundle })`, {
    URL, Map, Promise, console: { warn() {} }, fetch,
    localizeContentData: async (value) => value,
    getFirebaseServices: async () => ({
      db: {}, firestoreSdk: {
        collection: (_db, name) => name,
        where: (...args) => args,
        query: (name) => name,
        getDocs
      }
    })
  });
}

test('a failed static request can recover without reloading the page', async () => {
  let requests = 0;
  const repo = repository({ fetch: async () => {
    if (++requests === 1) throw new Error('temporarily offline');
    return response();
  } });
  await assert.rejects(repo.loadPublishedTests(), /temporarily offline/);
  assert.equal((await repo.loadPublishedTests())[0].slug, 'example');
  assert.equal(requests, 2);
});

test('invalid static JSON can be retried', async () => {
  let requests = 0;
  const repo = repository({ fetch: async () => ++requests === 1
    ? { ok: true, json: async () => { throw new Error('invalid JSON'); } }
    : response() });
  await assert.rejects(repo.loadPublishedTests(), /invalid JSON/);
  assert.equal((await repo.loadPublishedTests()).length, 1);
  assert.equal(requests, 2);
});

test('concurrent readers share static and remote requests', async () => {
  let staticRequests = 0;
  let remoteRequests = 0;
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const repo = repository({
    fetch: async () => { staticRequests++; return response(); },
    getDocs: async () => { remoteRequests++; await pending; return { docs: [] }; }
  });
  const first = repo.loadPublishedTests();
  const second = repo.loadPublishedTests();
  await Promise.resolve();
  release();
  await Promise.all([first, second]);
  assert.equal(staticRequests, 1);
  assert.equal(remoteRequests, 1);
});

test('settled remote reads are refreshed and archived content is removed', async () => {
  let reads = 0;
  const repo = repository({ getDocs: async () => ({ docs: ++reads === 1 ? [] : [
    { data: () => ({ slug: 'example', status: 'archived' }) }
  ] }) });
  assert.equal((await repo.loadPublishedTests()).length, 1);
  assert.equal((await repo.loadPublishedTests()).length, 0);
  assert.equal(reads, 2);
});

test('a failed remote request falls back and is retried on the next read', async () => {
  let reads = 0;
  const repo = repository({ getDocs: async () => {
    if (++reads === 1) throw new Error('temporarily unavailable');
    return { docs: [{ data: () => ({ ...published, title: 'Updated title' }) }] };
  } });
  assert.equal((await repo.loadPublishedTests())[0].title, 'Static title');
  assert.equal((await repo.loadPublishedTests())[0].title, 'Updated title');
  assert.equal(reads, 2);
});

test('different collections do not share a request', async () => {
  const collections = [];
  const repo = repository({ getDocs: async (name) => {
    collections.push(name); return { docs: [] };
  } });
  await Promise.all([repo.loadPublishedTests(), repo.loadPublishedBalanceGames()]);
  assert.deepEqual(collections.sort(), ['balance_content', 'tests']);
});

test('entry scripts and shared locale/content modules use consistent versioned URLs', async () => {
  const modules = [
    'app', 'game-list', 'content-repository', 'test-app',
    'game-app', 'balance-app', 'my-app', 'test-list'
  ];
  const localeVersions = new Set();
  const contentVersions = new Set();
  for (const name of modules) {
    const text = await readFile(new URL(`../src/site/assets/js/${name}.js`, import.meta.url), 'utf8');
    for (const match of text.matchAll(/['"]\.\/locale\.js([^'"]*)['"]/g)) localeVersions.add(match[1]);
    for (const match of text.matchAll(/['"]\.\/content-repository\.js([^'"]*)['"]/g)) contentVersions.add(match[1]);
  }
  assert.equal(localeVersions.size, 1);
  assert.equal(contentVersions.size, 1);
  const localeVersion = [...localeVersions][0];
  assert.match(localeVersion, /^\?v=.+/);
  assert.match([...contentVersions][0], /^\?v=.+/);
  for (const [page, entry] of [['index.html', 'app'], ['test/index.html', 'test-list'],
    ['game/index.html', 'game-list'], ['vote/index.html', 'balance-app'], ['my/index.html', 'my-app']]) {
    const html = await readFile(new URL(`../src/site/${page}`, import.meta.url), 'utf8');
    assert.ok(html.includes(`${entry}.js${localeVersion}`), `${page} entry must use the current locale revision`);
  }
});
