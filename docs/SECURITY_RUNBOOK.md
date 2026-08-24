# DAILY TEST LAB 보안 사고 대응

참조코드: `REF-DAILYFUN-SECURITY-HARDEN-03`

## 기본 방어 상태

- Firestore는 명시적으로 허용한 문서만 읽고 쓸 수 있으며 삭제는 전부 차단한다.
- 투표 문서와 집계 증가는 하나의 원자적 작업으로만 허용한다.
- 회원과 점수는 소유자만 읽고 쓸 수 있다.
- 브라우저 코드와 공개 화면에는 관리자 이메일을 넣지 않고 Firestore 서버 규칙에서 권한을 확인한다.
- App Check 코드는 모니터링 준비 상태이며 사이트 키가 없으면 동작하지 않는다.
- GitHub Actions 외부 코드는 전체 커밋 SHA로 고정한다.

## 공격 의심 시 즉시 읽기 전용 전환

읽기 전용 규칙은 기존 문서를 삭제하지 않고 모든 새 쓰기만 차단한다.

```bash
npm ci
npm run test:rules
npx firebase-tools deploy --only firestore:rules --project daily-test-lab --config firebase.lockdown.json --non-interactive
```

GitHub의 `Firestore emergency rules` 워크플로가 인증 준비된 경우 `lockdown` 입력으로 같은 작업을 수행할 수 있다. 배포 뒤 회원 로그인·공개 콘텐츠 조회는 유지되지만 새 투표·점수·관리자 수정은 차단된다.

## 조사 순서

1. Firebase Authentication의 비정상 가입 증가, Firestore 사용량과 거부 요청을 시간대별로 확인한다.
2. GitHub의 감사 로그, Actions 실행, Deployments, 보안 경고를 확인한다.
3. 의심 세션과 토큰을 폐기하고 계정 비밀번호·2단계 인증을 점검한다.
4. 암호화 백업의 생성 시각과 문서 수를 검증한다. 채팅이나 이슈에 회원 데이터·키를 붙이지 않는다.
5. 원인을 수정하고 정상·비상 규칙 Emulator 테스트를 모두 통과시킨다.

## 정상 복구

```bash
npm ci
npm run test:rules
npx firebase-tools deploy --only firestore:rules --project daily-test-lab --config firebase.json --non-interactive
```

필요할 때만 암호화 백업을 별도 안전 환경에서 해제한 뒤 먼저 dry run으로 대상과 개수를 확인한다.

```bash
node scripts/backup-crypto.mjs decrypt firestore-backup.dtlb firestore-backup.json
FIREBASE_PROJECT_ID=daily-test-lab node scripts/restore-firestore.mjs firestore-backup.json
```

실제 복원은 `RESTORE_CONFIRM_PROJECT=daily-test-lab`와 `--apply`를 함께 요구한다. 백업에 없는 문서는 자동 삭제하지 않는다.

## 복구 완료 기준

- 정상 규칙과 비상 규칙 자동 테스트 통과
- 공개 페이지와 공개 Firestore 읽기 정상
- 다른 사용자의 회원·점수 읽기 거부
- 새 투표가 한 번만 반영됨
- 관리자 초안 조회와 저장 정상
- 원인을 제거한 뒤에만 App Check 강제 적용 검토
