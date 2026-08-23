# REF-DAILYFUN-STEP8-CONTENT-CRUD-01 — 0원 MVP 구조

## 선택 구조

| 구분 | 선택 | 이유 |
|---|---|---|
| 화면 | 순수 HTML/CSS/JavaScript | 빠른 로딩, 프레임워크 종속성 제거 |
| 빌드 | Node.js 내장 모듈 | npm 유료/외부 빌드 도구 없이 재현 가능 |
| 저장소 | GitHub 저장소 | 코드 백업과 Actions 자동 빌드 |
| 호스팅 | GitHub Pages | 정적 사이트를 무료 범위에서 배포 |
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
/my/
/admin/
/legal/privacy/
/legal/terms/
/legal/ads/
/contact/
```

미니게임 기록은 브라우저 저장소의 `daily-test-lab.game-records.v1`과 Firebase의
`game_scores/{uid}/scores/{gameId}`에 게임별 최고 기록·마지막 기록·누적 도전 횟수를
저장합니다. 첫 기록 저장 시 익명 Firebase 계정을 만들기 때문에 로그인 절차 없이 바로
플레이할 수 있습니다. 사용자가 Google 로그인을 선택하면 기존 게스트 기록을 회원 계정으로
합쳐 다른 기기에서도 이어볼 수 있습니다. 점수 방향(`lower`/`higher`)은 콘텐츠 데이터에
명시해 낮은 기록과 높은 기록 게임을 올바르게 병합합니다.

회원 프로필은 `users/{uid}`에 이름·이메일·로그인 제공자·생성/최근 로그인 시각만 저장합니다.
Firestore 규칙은 본인 UID의 프로필과 점수만 읽고 쓰도록 제한하고, 최고 기록이 나빠지거나
누적 도전 횟수가 줄어드는 갱신은 거부합니다.

콘텐츠별 `{slug}/index.html`을 빌드 시 생성하여 독립 URL과 검색 노출에 대응합니다.

## 오늘의 콘텐츠·관리자 구조

공개 홈은 먼저 정적 `daily-content.json`을 표시한 뒤 `daily_contents/current` 문서가
있으면 관리자 지정 콘텐츠로 교체합니다. 따라서 Firebase 연결이 잠시 지연되어도 홈 화면은
계속 동작합니다. `/admin/`에서 기존 콘텐츠를 불러오거나 문구·아이콘·연결 주소를 편집하고
미리본 뒤 즉시 게시할 수 있습니다.

관리자 쓰기는 Google 인증 제공자, 이메일 인증 완료, 승인 이메일
`kpa100plus@gmail.com`을 Firestore 규칙에서 모두 확인합니다. 공개 사용자는
`daily_contents/current` 한 문서만 읽을 수 있고 목록 조회·삭제·다른 문서 쓰기는 차단됩니다.

## 심리테스트 콘텐츠 구조

기본 콘텐츠는 `src/content/tests.json`에 두고 관리자가 저장한 변경분은
`tests/{slug}`, `test_questions/{slug}`, `test_results/{slug}`에 분리합니다.
공개 화면은 Firebase 변경분을 우선 적용하며 연결이 지연되면 정적 기본 콘텐츠로 복구합니다.

- `capacity`: 1차 목표인 50개 등록 가능 여부를 검증합니다.
- `slug`: `/test/{slug}/`와 `/test/{slug}/result/` 독립 주소를 생성합니다.
- `questions[].options[].scores`: 결과 ID별 점수를 합산합니다.
- `results`: 결과 제목·설명·특징·활용 팁·공유 문구를 보관합니다.
- `recommendations`: 결과 하단에 연결할 다음 테스트를 지정합니다.

GitHub Pages는 실행 중 새 경로를 만들 수 없으므로 빌드 시 `/test/test-slot-001/`부터
`/test/test-slot-050/`까지 상세·결과 페이지를 미리 생성합니다. 관리자는 빈 슬롯을 자동 배정받아
HTML 수정 없이 새 테스트를 공개할 수 있습니다.

## 밸런스 게임 콘텐츠·투표 구조

기본 질문은 `src/content/balance-games.json`에 두고 관리자 변경분은
`balance_content/{slug}`에 저장합니다. `balance_games/{slug}`는 누적 투표 수만 보관하여
콘텐츠 수정·보관 시에도 기존 투표 통계가 유지됩니다.

- `capacity`: 최소 100개 이상 등록 가능한 구조인지 검증합니다.
- `slug`: `/vote/{slug}/` 독립 주소를 빌드 시 자동 생성합니다.
- `status`: 공개 질문만 목록과 상세 페이지에 노출합니다.
- `options`: `a`, `b` 두 선택지와 짧은 결과 표시 문구를 보관합니다.
- 한국 날짜를 기준으로 `/vote/`의 오늘 질문이 매일 자동 변경됩니다.
- `/vote/balance-slot-001/`부터 `/vote/balance-slot-120/`까지 무료 관리자 슬롯을 미리 생성합니다.

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
balance_content
votes
mini_games
game_scores
daily_contents
shares
analytics
```

현재 보안 규칙은 밸런스 통계 공개 읽기, 익명 사용자별 1회 투표, 본인 회원 프로필과
본인 게임 점수 읽기·쓰기, 공개/보관 콘텐츠 읽기, 승인된 Google 관리자 한 명의 통합 콘텐츠
쓰기를 허용합니다. 초안은 관리자만 읽을 수 있고 삭제는 복구 가능한 보관 상태로 처리합니다.

## 0원 한계

- Firebase Spark 한도를 넘으면 자동 과금되지 않고 기능이 제한됩니다.
- Firebase Cloud Storage와 전화번호 인증은 사용하지 않습니다.
- Cloudflare Pages의 `pages.dev` 주소는 개발·공개 테스트용입니다.
- Google AdSense는 일반 무료 하위도메인을 신규 사이트로 받지 않으므로 수익화 단계에서 자체 도메인 또는 Blogger 호스트 연계를 별도로 결정해야 합니다.
