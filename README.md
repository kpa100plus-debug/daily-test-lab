# DAILY TEST LAB

비용 0원으로 시작하는 모바일 우선 테스트·밸런스 게임·미니게임 플랫폼입니다.

## 현재 단계

- 참조코드: `REF-DAILYFUN-STEP4-VOTE-01`
- 완료 범위: STEP 1 무료 개발환경, STEP 2 모바일 메인, STEP 3 심리테스트 3종, STEP 4 데이터 기반 밸런스 게임 20종
- STEP 4 기능: 오늘의 질문·질문별 독립 URL·1회 투표·결과 비율·참여자 수·공유·120개 확장 구조·Firebase 익명 전체 집계와 안전한 로컬 대체 저장
- 다음 범위: STEP 5 미니게임 3종(반응속도·기억력·숫자 순서)

## 운영 주소

- 서비스: https://kpa100plus-debug.github.io/daily-test-lab/
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
- Cloudflare Pages 빌드 명령: `npm run build`
- 출력 폴더: `dist`
- 운영 브랜치: `main`
- Firebase Hosting과 Cloud Storage는 사용하지 않습니다.

상세 연결 순서는 [`docs/STEP1_CONNECT.md`](docs/STEP1_CONNECT.md)를 확인합니다.
