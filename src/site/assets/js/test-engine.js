export function calculateTestResult(test, answers) {
  if (!Array.isArray(test?.results) || !test.results.length) {
    throw new Error('Test result definitions are missing.');
  }

  const scores = Object.fromEntries(test.results.map((result) => [result.id, 0]));
  for (const answer of answers || []) {
    for (const [resultId, value] of Object.entries(answer?.scores || {})) {
      if (resultId in scores) scores[resultId] += Number(value) || 0;
    }
  }

  return test.results.reduce((winner, candidate) => (
    scores[candidate.id] > scores[winner.id] ? candidate : winner
  ), test.results[0]);
}
