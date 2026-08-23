export const DAILY_CONTENT_ACCENTS = ['violet', 'coral', 'orange', 'blue', 'mint'];

const limits = {
  category: 40,
  title: 80,
  description: 180,
  duration: 30,
  actionLabel: 30,
  note: 80,
  icon: 16,
  route: 160
};

function text(value, field, required = true) {
  const normalized = String(value ?? '').trim();
  if (required && !normalized) throw new Error(`${field} 항목을 입력해 주세요.`);
  if ([...normalized].length > limits[field]) {
    throw new Error(`${field} 항목이 너무 깁니다.`);
  }
  return normalized;
}

export function isSafeDailyRoute(route) {
  return /^\/(test|vote|game)\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(String(route || ''));
}

export function normalizeDailyContent(input = {}) {
  const accent = String(input.accent || 'violet').trim();
  if (!DAILY_CONTENT_ACCENTS.includes(accent)) {
    throw new Error('지원하지 않는 카드 색상입니다.');
  }

  const route = text(input.route, 'route');
  if (!isSafeDailyRoute(route)) {
    throw new Error('서비스 안의 테스트·밸런스·게임 주소만 등록할 수 있습니다.');
  }

  return {
    category: text(input.category, 'category'),
    title: text(input.title, 'title'),
    description: text(input.description, 'description'),
    duration: text(input.duration, 'duration'),
    actionLabel: text(input.actionLabel, 'actionLabel'),
    note: text(input.note, 'note', false),
    icon: text(input.icon, 'icon'),
    accent,
    route,
    status: 'published'
  };
}

export function createDailyContentDocument(input, userId, updatedAt) {
  const normalized = normalizeDailyContent(input);
  if (!userId) throw new Error('관리자 사용자 정보가 없습니다.');
  return {
    ...normalized,
    updatedBy: userId,
    updatedAt
  };
}
