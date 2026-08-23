export function shuffleValues(values, random = Math.random) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function createReactionDelay(random = Math.random, minimum = 1500, maximum = 3500) {
  return Math.round(minimum + random() * (maximum - minimum));
}

export function extendMemorySequence(sequence, tileCount = 6, random = Math.random) {
  const nextTile = Math.min(tileCount - 1, Math.floor(random() * tileCount));
  return [...sequence, Math.max(0, nextTile)];
}

export function createNumberBoard(count = 12, random = Math.random) {
  return shuffleValues(Array.from({ length: count }, (_, index) => index + 1), random);
}

export function isBetterScore(direction, score, bestScore) {
  if (!Number.isFinite(bestScore)) return true;
  return direction === 'higher' ? score > bestScore : score < bestScore;
}

export function formatGameScore(slug, score) {
  const safeScore = Math.max(0, Number(score) || 0);
  if (slug === 'memory') return `${Math.round(safeScore)}단계`;
  if (slug === 'number-order') return `${(safeScore / 1000).toFixed(2)}초`;
  return `${Math.round(safeScore)}ms`;
}

export function getGameRating(slug, score) {
  const value = Math.max(0, Number(score) || 0);

  if (slug === 'reaction-speed') {
    if (value < 180) return { emoji: '🚀', title: '번개보다 빠른 손', description: '놀라운 반응이에요. 다시 해도 이 기록이 나올까요?' };
    if (value < 230) return { emoji: '⚡', title: '매우 빠른 반응', description: '순간을 놓치지 않는 반응속도예요.' };
    if (value < 300) return { emoji: '🏃', title: '빠른 편이에요', description: '평소에도 눈치가 빠르다는 말을 듣는 편이겠어요.' };
    if (value < 400) return { emoji: '👍', title: '안정적인 반응', description: '한 번 더 하면 기록을 크게 줄일 수 있어요.' };
    return { emoji: '🌱', title: '이제 몸이 풀렸어요', description: '첫 기록은 준비 운동! 다시 도전해 보세요.' };
  }

  if (slug === 'memory') {
    if (value >= 8) return { emoji: '🏆', title: '기억력 마스터', description: '8단계를 모두 통과한 완벽한 집중력이에요.' };
    if (value >= 6) return { emoji: '🧠', title: '선명한 기억력', description: '긴 순서도 안정적으로 기억했어요.' };
    if (value >= 4) return { emoji: '✨', title: '집중력이 좋아요', description: '조금만 더 집중하면 최고 단계가 보여요.' };
    return { emoji: '🌿', title: '기억 워밍업 완료', description: '빛나는 간격을 따라가며 다시 도전해 보세요.' };
  }

  if (value < 5000) return { emoji: '🚀', title: '숫자 탐색 달인', description: '눈과 손이 거의 동시에 움직였어요.' };
  if (value < 8000) return { emoji: '🎯', title: '매우 빠른 집중력', description: '흐트러짐 없이 숫자를 찾아냈어요.' };
  if (value < 12000) return { emoji: '👏', title: '좋은 기록이에요', description: '다음 판에서는 동선을 더 줄여보세요.' };
  return { emoji: '🌱', title: '탐색 감각을 깨웠어요', description: '숫자 위치를 넓게 보며 다시 도전해 보세요.' };
}
