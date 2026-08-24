# Firebase App Check 모니터링 준비

현재 클라이언트는 reCAPTCHA Enterprise 기반 App Check를 지원하지만 `siteKey`가 빈 값이어서 토큰을 요청하지 않는다. Firestore 강제 적용도 켜지 않는다.

안전한 적용 순서:

1. Firebase App Check에서 웹 앱을 reCAPTCHA Enterprise 제공자로 등록한다.
2. 공개 사이트 키를 GitHub Actions 변수 `FIREBASE_APP_CHECK_SITE_KEY`로 등록한다. 로컬 검증 시에는 같은 이름의 환경변수를 사용할 수 있다. 비밀키는 저장소에 넣지 않는다.
3. 배포 후 최소 7일 동안 App Check 요청 지표와 정상 로그인·투표·점수 저장을 확인한다.
4. 유효 요청 비율과 실제 기능이 정상일 때만 Firestore 강제 적용을 별도 변경으로 검토한다.

본 작업에서는 정상 사용자 차단을 피하기 위해 4단계를 수행하지 않는다.
