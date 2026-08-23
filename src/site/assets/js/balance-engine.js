export function normalizeVoteStats(stats = {}) {
  const a = Math.max(0, Number.parseInt(stats.a, 10) || 0);
  const b = Math.max(0, Number.parseInt(stats.b, 10) || 0);
  return { a, b, total: a + b };
}

export function applyVote(stats, choice) {
  if (choice !== 'a' && choice !== 'b') {
    throw new Error('Choice must be a or b.');
  }

  const next = normalizeVoteStats(stats);
  next[choice] += 1;
  next.total += 1;
  return next;
}

export function calculateVotePercentages(stats) {
  const normalized = normalizeVoteStats(stats);
  if (!normalized.total) return { a: 50, b: 50 };

  const a = Math.round((normalized.a / normalized.total) * 100);
  return { a, b: 100 - a };
}

export function selectDailyGame(items, dateKey) {
  if (!Array.isArray(items) || !items.length) return null;
  const hash = String(dateKey || '')
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return items[Math.abs(hash) % items.length];
}
