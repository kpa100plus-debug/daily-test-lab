function numeric(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function updatedAtMillis(value) {
  if (value && typeof value.toMillis === 'function') return value.toMillis();
  if (value && Number.isFinite(Number(value.seconds))) {
    return Number(value.seconds) * 1000 + Math.round((Number(value.nanoseconds) || 0) / 1e6);
  }
  if (value && Number.isFinite(Number(value._seconds))) {
    return Number(value._seconds) * 1000 + Math.round((Number(value._nanoseconds) || 0) / 1e6);
  }
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeScoreRecord(record = {}) {
  const best = numeric(record.best, Number.NaN);
  return {
    best,
    last: numeric(record.last, Number.isFinite(best) ? best : 0),
    attempts: Math.max(0, Math.round(numeric(record.attempts, 0))),
    updatedAt: record.updatedAt || null
  };
}

export function selectBestScore(direction, first, second) {
  const values = [Number(first), Number(second)].filter(Number.isFinite);
  if (!values.length) return 0;
  return direction === 'higher' ? Math.max(...values) : Math.min(...values);
}

export function mergeScoreRecords(direction, localRecord = {}, remoteRecord = {}) {
  const local = normalizeScoreRecord(localRecord);
  const remote = normalizeScoreRecord(remoteRecord);
  const localHasData = Number.isFinite(local.best) || local.attempts > 0;
  const remoteHasData = Number.isFinite(remote.best) || remote.attempts > 0;
  const localIsNewer = localHasData && (
    !remoteHasData || updatedAtMillis(local.updatedAt) >= updatedAtMillis(remote.updatedAt)
  );
  return {
    best: selectBestScore(direction, local.best, remote.best),
    last: localIsNewer ? local.last : remote.last,
    attempts: Math.max(local.attempts, remote.attempts),
    updatedAt: localIsNewer ? local.updatedAt : remote.updatedAt
  };
}

export function mergeScoreCollections(games, localRecords = {}, remoteRecords = {}) {
  const merged = { ...localRecords };
  for (const game of games) {
    const local = localRecords[game.slug];
    const remote = remoteRecords[game.slug];
    if (!local && !remote) continue;
    merged[game.slug] = mergeScoreRecords(game.scoreDirection, local, remote);
  }
  return merged;
}
