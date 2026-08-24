# DAILY TEST LAB

비용 0원으로 시작하는 모바일 우선 테스트·밸런스 게임·미니게임 플랫폼입니다.

## 현재 단계

- 참조코드: `REF-DAILYFUN-STEP12-ADSENSE-READINESS-01`
- 완료 범위: STEP 1~10 구축·배포, 심리테스트 10종, 밸런스게임 50종, 미니게임 3종, 회원 기록, 오늘의 콘텐츠, 통합 관리자 CRUD, SEO·Search Console 준비
- STEP 4 기능: 오늘의 질문·질문별 독립 URL·1회 투표·결과 비율·참여자 수·공유·120개 확장 구조·Firebase 익명 전체 집계와 안전한 로컬 대체 저장
- STEP 5 기능: 반응속도·기억력·숫자 순서 미니게임, 독립 URL, 최고 기록·누적 도전 저장, 다시 도전·공유
- STEP 6 기능: 즉시 플레이 가능한 Firebase 익명 기록, 선택형 Google 로그인, 기존 게스트 기록 승계, MY 기록 화면, 사용자별 Firestore 보안 규칙
- STEP 7 기능: Google 관리자 인증, Firebase 오늘 콘텐츠 선택·문구 편집·실시간 미리보기·홈 즉시 반영, 관리자 전용 쓰기 규칙
- STEP 8 기능: 심리테스트 메타·질문·선택지 점수·결과 유형·밸런스게임 생성/조회/수정/공개/보관, 50개 테스트·120개 밸런스 독립 URL 슬롯, 정적 콘텐츠 안전 백업
- STEP 9 기능: 공개 콘텐츠 SEO·사이트맵·구조화 데이터·법정 안내 페이지·Search Console 준비
- STEP 10 기능: GitHub Pages 자동 빌드·검증·배포
- STEP 11 기능: 심리테스트 10종·밸런스게임 50종으로 공개 콘텐츠 확장
- STEP 12 기능: 서비스 소개·콘텐츠 운영 원칙, 승인 전 빈 광고 제거, 실제 ID가 있을 때만 광고·ads.txt를 생성하는 AdSense 안전장치

## 운영 주소

- 서비스: https://kpa100plus-debug.github.io/daily-test-lab/
- 서비스 소개: https://kpa100plus-debug.github.io/daily-test-lab/about/
- 관리자: https://kpa100plus-debug.github.io/daily-test-lab/admin/
- 저장소: https://github.com/kpa100plus-debug/daily-test-lab
- Firebase 프로젝트 ID: `daily-test-lab` (Spark 무료 요금제)

## 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 검증

```bash
npm test
```

## 배포 설정

- GitHub Pages: `main` 브랜치 푸시 시 Actions 자동 배포
- 출력 폴더: `dist`
- 운영 브랜치: `main`
- Firebase Hosting과 Cloud Storage는 사용하지 않습니다.

현재 GitHub Pages 프로젝트 URL에는 경로가 포함되어 AdSense 신청 주소로 사용할 수 없습니다. 비용 0원을 유지하는 수익화 경로는 Google 호스트 파트너인 Blogger 연계이며, 자세한 내용은 [`docs/STEP9_SEO_ADSENSE.md`](docs/STEP9_SEO_ADSENSE.md)를 확인합니다.

상세 연결 순서는 [`docs/STEP1_CONNECT.md`](docs/STEP1_CONNECT.md)를 확인합니다.
