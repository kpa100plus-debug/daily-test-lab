# REF-DAILYFUN-STEP1-ARCH-01 — 0원 MVP 구조

## 선택 구조

| 구분 | 선택 | 이유 |
|---|---|---|
| 화면 | 순수 HTML/CSS/JavaScript | 빠른 로딩, 프레임워크 종속성 제거 |
| 빌드 | Node.js 내장 모듈 | npm 유료/외부 빌드 도구 없이 재현 가능 |
| 저장소 | GitHub 비공개 저장소 | 코드 백업과 Cloudflare 자동 배포 |
| 호스팅 | Cloudflare Pages Free | 정적 파일 전송 비용 0원 범위 활용 |
| DB | Cloud Firestore Standard/Spark | 테스트·투표·점수·오늘의 콘텐츠 저장 |
| 로그인 | Firebase Authentication | 이메일/Google/익명 로그인 사용, 전화 인증 미사용 |
| 이미지 | Git 저장소의 정적 이미지 | Firebase Storage의 유료 플랜 요구 회피 |
| 분석 | Google Analytics | 출시 직전에 연결 |

## URL 구조

```text
/
/test/
/test/{slug}/
/vote/
/vote/{slug}/
/game/
/game/reaction-speed/
/game/memory/
/game/number-order/
/admin/
/legal/privacy/
/legal/terms/
/legal/ads/
/contact/
```

콘텐츠별 `{slug}/index.html`을 빌드 시 생성하여 독립 URL과 검색 노출에 대응합니다.

## 데이터 컬렉션

```text
users
tests
test_questions
test_results
balance_games
votes
mini_games
game_scores
daily_contents
shares
analytics
```

초기 보안 규칙은 모든 접근을 거부합니다. 실제 기능을 추가할 때 공개 읽기, 본인 기록 쓰기, 관리자 쓰기 규칙을 각각 최소 범위로 엽니다.

## 0원 한계

- Firebase Spark 한도를 넘으면 자동 과금되지 않고 기능이 제한됩니다.
- Firebase Cloud Storage와 전화번호 인증은 사용하지 않습니다.
- Cloudflare Pages의 `pages.dev` 주소는 개발·공개 테스트용입니다.
- Google AdSense는 일반 무료 하위도메인을 신규 사이트로 받지 않으므로 수익화 단계에서 자체 도메인 또는 Blogger 호스트 연계를 별도로 결정해야 합니다.

