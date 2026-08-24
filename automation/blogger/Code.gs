/**
 * DAILY TEST LAB Blogger sync
 * Source of truth: GitHub automation/blogger/content.json
 * Runtime: Google Apps Script (V8)
 */

const DAILY_TEST_LAB_BLOGGER = Object.freeze({
  blogId: '5587300283797440679',
  contentUrl:
    'https://raw.githubusercontent.com/kpa100plus-debug/daily-test-lab/main/automation/blogger/content.json',
  apiBase: 'https://www.googleapis.com/blogger/v3',
  syncFunction: 'syncDailyTestLabBlogger',
  triggerEveryHours: 6,
});

/**
 * Run this once after pasting Code.gs and appsscript.json.
 * It verifies the target blog, syncs enabled content, and installs one trigger.
 */
function setupDailyTestLabBlogger() {
  const blog = bloggerRequest_(
    '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId),
    'get'
  );

  if (String(blog.id) !== DAILY_TEST_LAB_BLOGGER.blogId) {
    throw new Error('Blogger blog ID mismatch. Setup stopped without writing.');
  }

  const result = syncDailyTestLabBlogger();
  installDailyTestLabBloggerTrigger_();

  console.log(
    JSON.stringify(
      {
        ok: true,
        blog: blog.name,
        blogUrl: blog.url,
        sync: result,
        triggerHours: DAILY_TEST_LAB_BLOGGER.triggerEveryHours,
      },
      null,
      2
    )
  );

  return result;
}

/**
 * Pulls the approved GitHub manifest and creates or updates Blogger content.
 * This function never deletes Blogger pages or posts.
 */
function syncDailyTestLabBlogger() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another Blogger sync is running. Try again shortly.');
  }

  try {
    const manifest = loadContentManifest_();
    validateContentManifest_(manifest);

    const result = {
      revision: manifest.revision,
      pages: { created: 0, updated: 0, skipped: 0 },
      posts: { created: 0, updated: 0, skipped: 0 },
      syncedAt: new Date().toISOString(),
    };

    syncPages_(manifest.pages || [], result.pages);
    syncPosts_(manifest.posts || [], result.posts);
    PropertiesService.getScriptProperties().setProperty(
      'dtl:lastSync',
      JSON.stringify(result)
    );

    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

/** Read-only status helper. */
function getDailyTestLabBloggerSyncStatus() {
  const properties = PropertiesService.getScriptProperties();
  const lastSync = properties.getProperty('dtl:lastSync');
  const triggers = ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === DAILY_TEST_LAB_BLOGGER.syncFunction;
  });

  const status = {
    blogId: DAILY_TEST_LAB_BLOGGER.blogId,
    contentUrl: DAILY_TEST_LAB_BLOGGER.contentUrl,
    triggerCount: triggers.length,
    lastSync: lastSync ? JSON.parse(lastSync) : null,
  };

  console.log(JSON.stringify(status, null, 2));
  return status;
}

function syncPages_(pages, counts) {
  const existingPages = listAll_('pages');

  pages.forEach(function (item) {
    if (!item.enabled) {
      counts.skipped += 1;
      return;
    }

    const marker = contentMarker_('page', item.key);
    const body = marker + '\n' + item.content;
    const storedId = getStoredResourceId_('page', item.key);
    let existing = findExistingResource_(existingPages, storedId, marker, item.title);

    if (existing && !resourceExists_('pages', existing.id)) {
      clearStoredResourceId_('page', item.key);
      existing = null;
    }

    const resource = {
      kind: 'blogger#page',
      blog: { id: DAILY_TEST_LAB_BLOGGER.blogId },
      title: item.title,
      content: body,
    };

    if (existing) {
      bloggerRequest_(
        '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId) +
          '/pages/' + encodeURIComponent(existing.id),
        'patch',
        resource
      );
      storeResourceId_('page', item.key, existing.id);
      counts.updated += 1;
      return;
    }

    const created = bloggerRequest_(
      '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId) +
        '/pages?isDraft=' + (item.isDraft ? 'true' : 'false'),
      'post',
      resource
    );
    storeResourceId_('page', item.key, created.id);
    existingPages.push(created);
    counts.created += 1;
  });
}

function syncPosts_(posts, counts) {
  const existingPosts = listAll_('posts');

  posts.forEach(function (item) {
    if (!item.enabled) {
      counts.skipped += 1;
      return;
    }

    const marker = contentMarker_('post', item.key);
    const body = marker + '\n' + item.content;
    const storedId = getStoredResourceId_('post', item.key);
    let existing = findExistingResource_(existingPosts, storedId, marker, item.title);

    if (existing && !resourceExists_('posts', existing.id)) {
      clearStoredResourceId_('post', item.key);
      existing = null;
    }

    const resource = {
      kind: 'blogger#post',
      blog: { id: DAILY_TEST_LAB_BLOGGER.blogId },
      title: item.title,
      content: body,
      labels: Array.isArray(item.labels) ? item.labels : [],
    };

    if (existing) {
      bloggerRequest_(
        '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId) +
          '/posts/' + encodeURIComponent(existing.id),
        'patch',
        resource
      );
      storeResourceId_('post', item.key, existing.id);
      counts.updated += 1;
      return;
    }

    const created = bloggerRequest_(
      '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId) +
        '/posts?isDraft=' + (item.isDraft ? 'true' : 'false'),
      'post',
      resource
    );
    storeResourceId_('post', item.key, created.id);
    existingPosts.push(created);
    counts.created += 1;
  });
}

function loadContentManifest_() {
  const response = UrlFetchApp.fetch(DAILY_TEST_LAB_BLOGGER.contentUrl, {
    method: 'get',
    followRedirects: true,
    muteHttpExceptions: true,
    headers: { Accept: 'application/json' },
  });

  if (response.getResponseCode() !== 200) {
    throw new Error(
      'GitHub content fetch failed (' + response.getResponseCode() + '). No Blogger changes were made.'
    );
  }

  return JSON.parse(response.getContentText('UTF-8'));
}

function validateContentManifest_(manifest) {
  if (!manifest || manifest.schemaVersion !== 1) {
    throw new Error('Unsupported Blogger content schema. No changes were made.');
  }
  if (String(manifest.blogId) !== DAILY_TEST_LAB_BLOGGER.blogId) {
    throw new Error('Content manifest blog ID mismatch. No changes were made.');
  }
  if (!manifest.revision || typeof manifest.revision !== 'string') {
    throw new Error('Content manifest revision is required. No changes were made.');
  }

  ['pages', 'posts'].forEach(function (collectionName) {
    const items = manifest[collectionName] || [];
    const keys = {};

    items.forEach(function (item) {
      if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(item.key || '')) {
        throw new Error('Invalid ' + collectionName + ' key: ' + item.key);
      }
      if (keys[item.key]) {
        throw new Error('Duplicate ' + collectionName + ' key: ' + item.key);
      }
      keys[item.key] = true;

      if (item.enabled && (!item.title || !item.content)) {
        throw new Error('Enabled item requires title and content: ' + item.key);
      }
      if (/<script\b|javascript\s*:|\son[a-z]+\s*=/i.test(item.content || '')) {
        throw new Error('Unsafe HTML blocked for item: ' + item.key);
      }
    });
  });
}

function listAll_(resourceName) {
  const items = [];
  let pageToken = '';

  do {
    let path =
      '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId) +
      '/' + resourceName + '?fetchBodies=true&maxResults=500&view=ADMIN';
    if (pageToken) {
      path += '&pageToken=' + encodeURIComponent(pageToken);
    }

    const page = bloggerRequest_(path, 'get');
    (page.items || []).forEach(function (item) {
      items.push(item);
    });
    pageToken = page.nextPageToken || '';
  } while (pageToken);

  return items;
}

function findExistingResource_(items, storedId, marker, title) {
  if (storedId) {
    const byId = items.find(function (item) {
      return String(item.id) === String(storedId);
    });
    if (byId) return byId;
  }

  const byMarker = items.find(function (item) {
    return String(item.content || '').indexOf(marker) !== -1;
  });
  if (byMarker) return byMarker;

  return items.find(function (item) {
    return String(item.title || '').trim() === String(title || '').trim();
  }) || null;
}

function resourceExists_(resourceName, resourceId) {
  try {
    bloggerRequest_(
      '/blogs/' + encodeURIComponent(DAILY_TEST_LAB_BLOGGER.blogId) +
        '/' + resourceName + '/' + encodeURIComponent(resourceId),
      'get'
    );
    return true;
  } catch (error) {
    if (String(error.message).indexOf('HTTP 404') !== -1) return false;
    throw error;
  }
}

function bloggerRequest_(path, method, body) {
  const request = {
    method: method || 'get',
    muteHttpExceptions: true,
    followRedirects: true,
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      Accept: 'application/json',
    },
  };

  if (body !== undefined) {
    request.contentType = 'application/json; charset=UTF-8';
    request.payload = JSON.stringify(body);
  }

  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = UrlFetchApp.fetch(DAILY_TEST_LAB_BLOGGER.apiBase + path, request);
    const code = response.getResponseCode();

    if (code >= 200 && code < 300) {
      const text = response.getContentText('UTF-8');
      return text ? JSON.parse(text) : {};
    }

    if (code !== 429 && code < 500) break;
    Utilities.sleep(Math.pow(2, attempt) * 1000);
  }

  const responseCode = response ? response.getResponseCode() : 'NO_RESPONSE';
  const responseText = response ? response.getContentText('UTF-8') : '';
  throw new Error(
    'Blogger API HTTP ' + responseCode + ': ' + responseText.slice(0, 1000)
  );
}

function installDailyTestLabBloggerTrigger_() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === DAILY_TEST_LAB_BLOGGER.syncFunction) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger(DAILY_TEST_LAB_BLOGGER.syncFunction)
    .timeBased()
    .everyHours(DAILY_TEST_LAB_BLOGGER.triggerEveryHours)
    .create();
}

function contentMarker_(type, key) {
  return '<!-- daily-test-lab:' + type + ':' + key + ' -->';
}

function propertyKey_(type, key) {
  return 'dtl:' + type + ':' + key;
}

function getStoredResourceId_(type, key) {
  return PropertiesService.getScriptProperties().getProperty(propertyKey_(type, key));
}

function storeResourceId_(type, key, id) {
  PropertiesService.getScriptProperties().setProperty(
    propertyKey_(type, key),
    String(id)
  );
}

function clearStoredResourceId_(type, key) {
  PropertiesService.getScriptProperties().deleteProperty(propertyKey_(type, key));
}
