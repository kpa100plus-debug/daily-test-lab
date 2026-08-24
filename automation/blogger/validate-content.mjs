import { readFile } from 'node:fs/promises';

const manifestPath = new URL('./content.json', import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];

const fail = (message) => failures.push(message);
const collections = ['pages', 'posts'];

if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1');
if (!/^\d+$/.test(String(manifest.blogId || ''))) fail('blogId must contain digits only');
if (!manifest.revision || typeof manifest.revision !== 'string') fail('revision is required');
if (!/^https:\/\//.test(manifest.primarySite || '')) fail('primarySite must use HTTPS');

for (const collectionName of collections) {
  const items = manifest[collectionName];
  if (!Array.isArray(items)) {
    fail(`${collectionName} must be an array`);
    continue;
  }

  const keys = new Set();
  for (const item of items) {
    const prefix = `${collectionName}:${item?.key || '(missing-key)'}`;
    if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(item?.key || '')) {
      fail(`${prefix} has an invalid key`);
    }
    if (keys.has(item?.key)) fail(`${prefix} is duplicated`);
    keys.add(item?.key);

    if (item?.enabled) {
      if (typeof item.title !== 'string' || item.title.trim().length < 2) {
        fail(`${prefix} requires a title`);
      }
      if (typeof item.content !== 'string' || item.content.trim().length < 80) {
        fail(`${prefix} requires substantial content`);
      }
    }

    const html = String(item?.content || '');
    if (/<script\b|javascript\s*:|\son[a-z]+\s*=/i.test(html)) {
      fail(`${prefix} contains unsafe HTML`);
    }
    if (/\bjuyoungkim\b|김주영/i.test(html)) {
      fail(`${prefix} exposes a personal administrator name`);
    }
  }
}

if (failures.length) {
  console.error('Blogger content validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Blogger content OK: ${manifest.pages.length} pages, ${manifest.posts.length} posts, revision ${manifest.revision}`
);
