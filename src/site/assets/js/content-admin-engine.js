export const CONTENT_STATUSES = ['draft', 'published', 'archived'];
export const CONTENT_ACCENTS = ['violet', 'coral', 'orange', 'blue', 'mint'];
export const TEST_SLOT_CAPACITY = 50;
export const BALANCE_SLOT_CAPACITY = 120;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value, label, maxLength, { required = true } = {}) {
  const normalized = String(value ?? '').trim();
  if (required && !normalized) throw new Error(`${label}을(를) 입력해 주세요.`);
  if (normalized.length > maxLength) throw new Error(`${label}은(는) ${maxLength}자 이하여야 합니다.`);
  return normalized;
}

function slug(value, label = '슬롯 주소') {
  const normalized = text(value, label, 80).toLowerCase();
  if (!SLUG_PATTERN.test(normalized)) {
    throw new Error(`${label}은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.`);
  }
  return normalized;
}

function id(value, label) {
  const normalized = text(value, label, 80).toLowerCase();
  if (!ID_PATTERN.test(normalized)) {
    throw new Error(`${label}은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.`);
  }
  return normalized;
}

function listFromText(value, maxItems, maxItemLength) {
  const source = Array.isArray(value) ? value : String(value ?? '').split(/[\n,]/);
  const items = source.map((item) => String(item).trim()).filter(Boolean);
  if (items.length > maxItems) throw new Error(`목록은 최대 ${maxItems}개까지 입력할 수 있습니다.`);
  if (items.some((item) => item.length > maxItemLength)) {
    throw new Error(`목록의 각 항목은 ${maxItemLength}자 이하여야 합니다.`);
  }
  return [...new Set(items)];
}

export function parseScoreMapping(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, score]) => {
      const resultId = id(key, '결과 ID');
      const numericScore = Number(score);
      if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 10) {
        throw new Error('점수는 1~10 사이의 정수여야 합니다.');
      }
      return [resultId, numericScore];
    }));
  }

  const scores = {};
  for (const pair of String(value ?? '').split(',')) {
    if (!pair.trim()) continue;
    const [rawKey, rawScore, ...rest] = pair.split(':');
    if (rest.length || rawScore === undefined) {
      throw new Error('점수 연결은 result-id:2 형식으로 입력해 주세요.');
    }
    const resultId = id(rawKey, '결과 ID');
    const numericScore = Number(String(rawScore).trim());
    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 10) {
      throw new Error('점수는 1~10 사이의 정수여야 합니다.');
    }
    scores[resultId] = numericScore;
  }
  if (!Object.keys(scores).length) throw new Error('각 선택지에 결과 점수를 하나 이상 연결해 주세요.');
  return scores;
}

export function formatScoreMapping(scores) {
  if (typeof scores === 'string') return scores.trim();
  return Object.entries(scores || {}).map(([key, score]) => `${key}:${score}`).join(', ');
}

export function createTestSlotSlugs(capacity = TEST_SLOT_CAPACITY) {
  return Array.from({ length: capacity }, (_, index) => `test-slot-${String(index + 1).padStart(3, '0')}`);
}

export function createBalanceSlotSlugs(capacity = BALANCE_SLOT_CAPACITY) {
  return Array.from({ length: capacity }, (_, index) => `balance-slot-${String(index + 1).padStart(3, '0')}`);
}

export function findAvailableSlot(kind, usedSlugs) {
  const slots = kind === 'test' ? createTestSlotSlugs() : createBalanceSlotSlugs();
  const used = new Set(usedSlugs || []);
  const available = slots.find((candidate) => !used.has(candidate));
  if (!available) throw new Error(`${kind === 'test' ? '심리테스트' : '밸런스게임'} 등록 슬롯이 모두 사용 중입니다.`);
  return available;
}

export function createBlankTest(slotSlug) {
  const normalizedSlug = slug(slotSlug);
  return {
    id: `test-${normalizedSlug}`,
    slug: normalizedSlug,
    status: 'draft',
    category: '성격·취향',
    icon: '✨',
    accent: 'violet',
    title: '새 심리테스트',
    shortTitle: '새 테스트',
    description: '이 테스트가 어떤 재미를 주는지 한 문장으로 소개해 주세요.',
    duration: '약 2분',
    questionCount: 1,
    participantLabel: '신규 테스트',
    disclaimer: '이 테스트는 재미와 자기이해를 위한 콘텐츠이며 전문적인 심리 진단이 아닙니다.',
    seo: {
      title: '새 심리테스트 | DAILY TEST LAB',
      description: '무료 심리테스트 결과를 바로 확인하고 친구와 공유해 보세요.'
    },
    questions: [{
      id: `${normalizedSlug}-q1`,
      text: '첫 번째 질문을 입력해 주세요.',
      options: [
        { id: 'a', text: '첫 번째 선택지', scores: { 'type-a': 2 } },
        { id: 'b', text: '두 번째 선택지', scores: { 'type-b': 2 } }
      ]
    }],
    results: [
      {
        id: 'type-a', emoji: '🌟', label: 'TYPE A', title: '첫 번째 결과',
        summary: '첫 번째 결과를 한 줄로 설명해 주세요.',
        description: '첫 번째 결과에 대한 자세한 설명을 입력해 주세요.',
        traits: ['대표 특징 1', '대표 특징 2', '대표 특징 3'],
        tips: ['도움이 되는 팁을 입력해 주세요.'],
        shareText: '나의 테스트 결과는 첫 번째 유형! 당신의 결과는?'
      },
      {
        id: 'type-b', emoji: '🌿', label: 'TYPE B', title: '두 번째 결과',
        summary: '두 번째 결과를 한 줄로 설명해 주세요.',
        description: '두 번째 결과에 대한 자세한 설명을 입력해 주세요.',
        traits: ['대표 특징 1', '대표 특징 2', '대표 특징 3'],
        tips: ['도움이 되는 팁을 입력해 주세요.'],
        shareText: '나의 테스트 결과는 두 번째 유형! 당신의 결과는?'
      }
    ],
    recommendations: []
  };
}

export function createBlankBalanceGame(slotSlug) {
  const normalizedSlug = slug(slotSlug);
  return {
    id: `balance-${normalizedSlug}`,
    slug: normalizedSlug,
    status: 'draft',
    category: '일상',
    icon: '⚖️',
    title: '새 밸런스 게임',
    question: '둘 중 하나만 고른다면?',
    description: '두 선택지를 비교할 수 있도록 상황을 짧게 설명해 주세요.',
    options: [
      { id: 'a', label: '첫 번째 선택', shortLabel: '선택 A', emoji: '🅰️' },
      { id: 'b', label: '두 번째 선택', shortLabel: '선택 B', emoji: '🅱️' }
    ],
    shareText: '둘 중 하나만 고른다면? 당신의 선택은?',
    seo: {
      title: '새 밸런스 게임 | DAILY TEST LAB',
      description: '둘 중 하나를 선택하고 다른 사람들의 결과 비율을 확인해 보세요.'
    }
  };
}

function normalizeStatus(value) {
  const status = String(value ?? 'draft');
  if (!CONTENT_STATUSES.includes(status)) throw new Error('콘텐츠 상태가 올바르지 않습니다.');
  return status;
}

function normalizeAccent(value) {
  const accent = String(value ?? 'violet');
  if (!CONTENT_ACCENTS.includes(accent)) throw new Error('카드 색상이 올바르지 않습니다.');
  return accent;
}

export function normalizeTestQuestions(testSlug, input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 50) {
    throw new Error('질문은 1~50개까지 등록할 수 있습니다.');
  }
  const normalizedSlug = slug(testSlug);
  const items = input.map((question, questionIndex) => {
    const options = Array.isArray(question.options) ? question.options : [];
    if (options.length < 2 || options.length > 5) {
      throw new Error(`${questionIndex + 1}번 질문의 선택지는 2~5개여야 합니다.`);
    }
    return {
      id: id(question.id || `${normalizedSlug}-q${questionIndex + 1}`, `${questionIndex + 1}번 질문 ID`),
      text: text(question.text, `${questionIndex + 1}번 질문`, 180),
      options: options.map((option, optionIndex) => ({
        id: id(option.id || String.fromCharCode(97 + optionIndex), `${questionIndex + 1}번 선택지 ID`),
        text: text(option.text, `${questionIndex + 1}번 선택지`, 160),
        scores: parseScoreMapping(option.scores)
      }))
    };
  });

  const questionIds = items.map((item) => item.id);
  if (new Set(questionIds).size !== questionIds.length) throw new Error('질문 ID는 서로 달라야 합니다.');
  for (const question of items) {
    const optionIds = question.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) throw new Error(`${question.id}의 선택지 ID가 중복됩니다.`);
  }
  return items;
}

export function normalizeTestResults(input) {
  if (!Array.isArray(input) || input.length < 2 || input.length > 20) {
    throw new Error('결과는 2~20개까지 등록할 수 있습니다.');
  }
  const items = input.map((result, index) => ({
    id: id(result.id, `${index + 1}번 결과 ID`),
    emoji: text(result.emoji, `${index + 1}번 결과 아이콘`, 16),
    label: text(result.label, `${index + 1}번 결과 영문 라벨`, 40),
    title: text(result.title, `${index + 1}번 결과 제목`, 80),
    summary: text(result.summary, `${index + 1}번 결과 요약`, 140),
    description: text(result.description, `${index + 1}번 결과 설명`, 600),
    traits: listFromText(result.traits, 8, 50),
    tips: listFromText(result.tips, 8, 180),
    shareText: text(result.shareText, `${index + 1}번 공유 문구`, 180)
  }));
  const resultIds = items.map((item) => item.id);
  if (new Set(resultIds).size !== resultIds.length) throw new Error('결과 ID는 서로 달라야 합니다.');
  if (items.some((item) => !item.traits.length || !item.tips.length)) {
    throw new Error('각 결과에는 특징과 활용 팁을 하나 이상 입력해 주세요.');
  }
  return items;
}

export function normalizeTestBundle(input, requestedStatus = input?.status) {
  const testSlug = slug(input?.slug);
  const status = normalizeStatus(requestedStatus);
  const questions = normalizeTestQuestions(testSlug, input?.questions);
  const results = normalizeTestResults(input?.results);
  const resultIds = new Set(results.map((result) => result.id));

  for (const question of questions) {
    for (const option of question.options) {
      if (Object.keys(option.scores).some((resultId) => !resultIds.has(resultId))) {
        throw new Error(`${question.id} 선택지에 존재하지 않는 결과 ID가 연결되어 있습니다.`);
      }
    }
  }
  if (status === 'published' && questions.length < 4) {
    throw new Error('공개 테스트는 질문이 4개 이상이어야 합니다.');
  }

  const recommendations = listFromText(input?.recommendations, 6, 80)
    .map((item) => slug(item, '추천 테스트 주소'))
    .filter((item) => item !== testSlug);
  const accent = normalizeAccent(input?.accent);
  const metadata = {
    schemaVersion: 1,
    id: id(input?.id || `test-${testSlug}`, '테스트 ID'),
    slug: testSlug,
    status,
    category: text(input?.category, '분류', 40),
    icon: text(input?.icon, '아이콘', 16),
    accent,
    title: text(input?.title, '테스트 제목', 100),
    shortTitle: text(input?.shortTitle, '짧은 제목', 50),
    description: text(input?.description, '테스트 설명', 240),
    duration: text(input?.duration, '소요 시간', 30),
    questionCount: questions.length,
    participantLabel: text(input?.participantLabel, '참여 문구', 60),
    disclaimer: text(input?.disclaimer, '안내 문구', 240),
    seo: {
      title: text(input?.seo?.title ?? input?.seoTitle, 'SEO 제목', 120),
      description: text(input?.seo?.description ?? input?.seoDescription, 'SEO 설명', 200)
    },
    recommendations
  };
  return { metadata, questions, results };
}

export function createTestDocuments(input, requestedStatus, userId, timestamp) {
  const { metadata, questions, results } = normalizeTestBundle(input, requestedStatus);
  const audit = { updatedBy: text(userId, '관리자 ID', 128), updatedAt: timestamp };
  return {
    metadata: { ...metadata, ...audit },
    questions: { schemaVersion: 1, testId: metadata.slug, items: questions, ...audit },
    results: { schemaVersion: 1, testId: metadata.slug, items: results, ...audit }
  };
}

export function normalizeBalanceGame(input, requestedStatus = input?.status) {
  const gameSlug = slug(input?.slug);
  const options = Array.isArray(input?.options) ? input.options : [];
  if (options.length !== 2) throw new Error('밸런스게임 선택지는 정확히 2개여야 합니다.');
  const normalizedOptions = options.map((option, index) => ({
    id: index === 0 ? 'a' : 'b',
    label: text(option.label, `${index + 1}번 선택지`, 100),
    shortLabel: text(option.shortLabel, `${index + 1}번 짧은 문구`, 40),
    emoji: text(option.emoji, `${index + 1}번 아이콘`, 16)
  }));
  return {
    schemaVersion: 1,
    id: id(input?.id || `balance-${gameSlug}`, '밸런스게임 ID'),
    slug: gameSlug,
    status: normalizeStatus(requestedStatus),
    category: text(input?.category, '분류', 40),
    icon: text(input?.icon, '아이콘', 16),
    title: text(input?.title, '관리 제목', 100),
    question: text(input?.question, '질문', 180),
    description: text(input?.description, '설명', 240),
    options: normalizedOptions,
    shareText: text(input?.shareText, '공유 문구', 180),
    seo: {
      title: text(input?.seo?.title ?? input?.seoTitle, 'SEO 제목', 120),
      description: text(input?.seo?.description ?? input?.seoDescription, 'SEO 설명', 200)
    }
  };
}

export function createBalanceDocument(input, requestedStatus, userId, timestamp) {
  return {
    ...normalizeBalanceGame(input, requestedStatus),
    updatedBy: text(userId, '관리자 ID', 128),
    updatedAt: timestamp
  };
}
