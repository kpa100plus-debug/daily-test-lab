import { getFirebaseServices } from './firebase-client.js';
import { localizeContentData } from './locale.js?v=i18n-2';

const staticUrls = {
  tests: new URL('../../data/tests.json', import.meta.url),
  balance: new URL('../../data/balance-games.json', import.meta.url)
};

const staticCache = new Map();
const pendingRemoteRequests = new Map();
const preserveSourceCategories = (items) => (items || []).map((item) => ({
  ...item,
  sourceCategory: item.sourceCategory || item.category
}));

async function loadStatic(kind) {
  if (!staticCache.has(kind)) {
    const pending = fetch(staticUrls[kind], { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error(`${kind} ${response.status}`);
      const data = await response.json();
      return Array.isArray(data.items) ? data.items : [];
    }).catch((error) => {
      // A temporary network/JSON failure must not poison the page's cache.
      if (staticCache.get(kind) === pending) staticCache.delete(kind);
      throw error;
    });
    staticCache.set(kind, pending);
  }
  return staticCache.get(kind);
}

async function loadPublicCollection(collectionName) {
  const services = await getFirebaseServices();
  const { collection, getDocs, query, where } = services.firestoreSdk;
  const contentQuery = query(
    collection(services.db, collectionName),
    where('status', 'in', ['published', 'archived'])
  );
  const snapshot = await getDocs(contentQuery);
  return snapshot.docs.map((documentSnapshot) => documentSnapshot.data());
}

export function mergePublishedContent(staticItems, remoteItems) {
  const merged = new Map(
    (staticItems || [])
      .filter((item) => item.status === 'published')
      .map((item) => [item.slug, item])
  );
  for (const item of remoteItems || []) {
    if (!item?.slug) continue;
    if (item.status === 'archived') merged.delete(item.slug);
    if (item.status === 'published') merged.set(item.slug, item);
  }
  return [...merged.values()];
}

async function loadRemoteOrEmpty(collectionName) {
  if (!pendingRemoteRequests.has(collectionName)) {
    // Share only active reads. The next read still sees new publications/archives.
    const pending = loadPublicCollection(collectionName)
      .catch((error) => {
        console.warn(`${collectionName} Firebase 콘텐츠 연결 지연:`, error?.message || error);
        return [];
      })
      .finally(() => {
        if (pendingRemoteRequests.get(collectionName) === pending) {
          pendingRemoteRequests.delete(collectionName);
        }
      });
    pendingRemoteRequests.set(collectionName, pending);
  }
  return pendingRemoteRequests.get(collectionName);
}

export async function loadPublishedTests() {
  const [staticItems, remoteItems] = await Promise.all([
    loadStatic('tests'),
    loadRemoteOrEmpty('tests')
  ]);
  return localizeContentData(preserveSourceCategories(
    mergePublishedContent(staticItems, remoteItems)
  ));
}

export async function loadTestBundle(testSlug) {
  const [staticItems, remoteItems] = await Promise.all([
    loadStatic('tests'),
    loadRemoteOrEmpty('tests')
  ]);
  const staticTest = staticItems.find((item) => item.slug === testSlug && item.status === 'published');
  const remoteTest = remoteItems.find((item) => item.slug === testSlug);
  if (remoteTest?.status === 'archived') return null;
  if (!remoteTest) return localizeContentData(
    staticTest ? preserveSourceCategories([staticTest])[0] : null
  );

  try {
    const services = await getFirebaseServices();
    const { doc, getDoc } = services.firestoreSdk;
    const [questionSnapshot, resultSnapshot] = await Promise.all([
      getDoc(doc(services.db, 'test_questions', testSlug)),
      getDoc(doc(services.db, 'test_results', testSlug))
    ]);
    if (!questionSnapshot.exists() || !resultSnapshot.exists()) {
      throw new Error('질문 또는 결과 문서가 없습니다.');
    }
    return localizeContentData({
      ...remoteTest,
      sourceCategory: remoteTest.sourceCategory || remoteTest.category,
      questions: questionSnapshot.data().items || [],
      results: resultSnapshot.data().items || []
    });
  } catch (error) {
    console.warn(`심리테스트 ${testSlug} 세부 콘텐츠 연결 지연:`, error?.message || error);
    return localizeContentData(
      staticTest ? preserveSourceCategories([staticTest])[0] : null
    );
  }
}

export async function loadPublishedBalanceGames() {
  const [staticItems, remoteItems] = await Promise.all([
    loadStatic('balance'),
    loadRemoteOrEmpty('balance_content')
  ]);
  return localizeContentData(preserveSourceCategories(
    mergePublishedContent(staticItems, remoteItems)
  ));
}
