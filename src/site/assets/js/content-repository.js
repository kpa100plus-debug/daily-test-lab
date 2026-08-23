import { getFirebaseServices } from './firebase-client.js';

const staticUrls = {
  tests: new URL('../../data/tests.json', import.meta.url),
  balance: new URL('../../data/balance-games.json', import.meta.url)
};

const staticCache = new Map();

async function loadStatic(kind) {
  if (!staticCache.has(kind)) {
    staticCache.set(kind, fetch(staticUrls[kind], { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error(`${kind} ${response.status}`);
      const data = await response.json();
      return Array.isArray(data.items) ? data.items : [];
    }));
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
  try {
    return await loadPublicCollection(collectionName);
  } catch (error) {
    console.warn(`${collectionName} Firebase 콘텐츠 연결 지연:`, error?.message || error);
    return [];
  }
}

export async function loadPublishedTests() {
  const [staticItems, remoteItems] = await Promise.all([
    loadStatic('tests'),
    loadRemoteOrEmpty('tests')
  ]);
  return mergePublishedContent(staticItems, remoteItems);
}

export async function loadTestBundle(testSlug) {
  const [staticItems, remoteItems] = await Promise.all([
    loadStatic('tests'),
    loadRemoteOrEmpty('tests')
  ]);
  const staticTest = staticItems.find((item) => item.slug === testSlug && item.status === 'published');
  const remoteTest = remoteItems.find((item) => item.slug === testSlug);
  if (remoteTest?.status === 'archived') return null;
  if (!remoteTest) return staticTest || null;

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
    return {
      ...remoteTest,
      questions: questionSnapshot.data().items || [],
      results: resultSnapshot.data().items || []
    };
  } catch (error) {
    console.warn(`심리테스트 ${testSlug} 세부 콘텐츠 연결 지연:`, error?.message || error);
    return staticTest || null;
  }
}

export async function loadPublishedBalanceGames() {
  const [staticItems, remoteItems] = await Promise.all([
    loadStatic('balance'),
    loadRemoteOrEmpty('balance_content')
  ]);
  return mergePublishedContent(staticItems, remoteItems);
}
