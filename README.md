# DAILY TEST LAB

비용 0원으로 시작하는 모바일 우선 테스트·밸런스 게임·미니게임 플랫폼입니다.

## 현재 단계

- 참조코드: `REF-DAILYFUN-ZERO-COST-MVP-02`
- 완료 범위: STEP 1 프로젝트 구조, 무의존성 빌드/검증, Firebase·Cloudflare 연결 준비
- 다음 범위: STEP 2 메인페이지 UI/콘텐츠 탐색 구조

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

- Cloudflare Pages 빌드 명령: `npm run build`
- 출력 폴더: `dist`
- 운영 브랜치: `main`
- Firebase Hosting과 Cloud Storage는 사용하지 않습니다.

상세 연결 순서는 [`docs/STEP1_CONNECT.md`](docs/STEP1_CONNECT.md)를 확인합니다.

