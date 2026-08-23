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

## 심리테스트 콘텐츠 구조

`src/content/tests.json` 한 파일에서 테스트·질문·선택지 점수·결과·추천 항목을 관리합니다.

- `capacity`: 1차 목표인 50개 등록 가능 여부를 검증합니다.
- `slug`: `/test/{slug}/`와 `/test/{slug}/result/` 독립 주소를 생성합니다.
- `questions[].options[].scores`: 결과 ID별 점수를 합산합니다.
- `results`: 결과 제목·설명·특징·활용 팁·공유 문구를 보관합니다.
- `recommendations`: 결과 하단에 연결할 다음 테스트를 지정합니다.

빌드 시 공개 상태인 테스트마다 상세·결과 페이지를 자동 생성하므로 새 테스트 등록에 HTML 추가 작업이 필요하지 않습니다.

## 밸런스 게임 콘텐츠·투표 구조

`src/content/balance-games.json`에서 질문·두 선택지·공유 문구·SEO 문구를 관리합니다.

- `capacity`: 최소 100개 이상 등록 가능한 구조인지 검증합니다.
- `slug`: `/vote/{slug}/` 독립 주소를 빌드 시 자동 생성합니다.
- `status`: 공개 질문만 목록과 상세 페이지에 노출합니다.
- `options`: `a`, `b` 두 선택지와 짧은 결과 표시 문구를 보관합니다.
- 한국 날짜를 기준으로 `/vote/`의 오늘 질문이 매일 자동 변경됩니다.

투표는 Firebase 익명 사용자별 `votes/{gameId}_{uid}` 문서를 한 번만 만들고,
`balance_games/{gameId}`의 A·B·전체 참여 수를 같은 트랜잭션에서 증가시킵니다.
보안 규칙은 새 투표 문서와 정확히 1표 증가한 통계가 함께 저장될 때만 쓰기를 허용합니다.
Firebase 연결이 지연되면 브라우저에 선택과 임시 통계를 저장해 콘텐츠 이용이 중단되지 않으며,
연결이 복구되면 기존 선택을 전체 집계로 자동 동기화합니다.

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
