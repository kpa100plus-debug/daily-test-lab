const cacheKey = 'daily-test-lab.member.v1';

try {
  const member = JSON.parse(localStorage.getItem(cacheKey) || '{}');
  if (member.type === 'member') {
    document.querySelectorAll('[data-member-link]').forEach((link) => {
      link.textContent = 'MY 기록';
      link.setAttribute('aria-label', `${member.displayName || '회원'}님의 기록`);
    });
  }
} catch {
  // 로그인 캐시가 없어도 기본 내 기록 링크를 그대로 유지합니다.
}
