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
  const titles = new Set();
  for (const item of items) {
    const prefix = `${collectionName}:${item?.key || '(missing-key)'}`;
    if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(item?.key || '')) {
      fail(`${prefix} has an invalid key`);
    }
    if (keys.has(item?.key)) fail(`${prefix} is duplicated`);
    keys.add(item?.key);

    const normalizedTitle = String(item?.title || '').trim().toLocaleLowerCase('ko-KR');
    if (normalizedTitle && titles.has(normalizedTitle)) fail(`${prefix} duplicates another title`);
    titles.add(normalizedTitle);

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

    if (collectionName === 'posts' && item?.enabled) {
      const readableText = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const headings = html.match(/<h[23]\b/gi) || [];
      const labels = Array.isArray(item.labels) ? item.labels.filter(Boolean) : [];

      if (item.isDraft !== false) fail(`${prefix} must be explicitly public (isDraft=false)`);
      if (labels.length < 2) fail(`${prefix} requires at least two useful labels`);
      if (readableText.length < 700) fail(`${prefix} requires at least 700 readable characters`);
      if (headings.length < 2) fail(`${prefix} requires a structured article with headings`);
      if (!html.includes(manifest.primarySite)) fail(`${prefix} must link back to the primary site`);
      if (!/(오락|재미)/.test(readableText) || !/전문/.test(readableText) || !/진단/.test(readableText)) {
        fail(`${prefix} requires a clear entertainment and non-diagnostic notice`);
      }
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
