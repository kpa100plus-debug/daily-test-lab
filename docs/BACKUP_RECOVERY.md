# Firestore 암호화 백업·복구

`Encrypted Firestore backup` 워크플로는 사용 설정 전에는 실행되지 않는다. 설정이 완료되면 매일 Firebase 문서를 읽어 JSON으로 내보내고, AES-256-GCM으로 암호화한 파일만 GitHub Actions artifact에 7일 보관한다. 평문은 업로드 전에 제거한다.

## 키 없는 인증

서비스 계정 JSON 키를 만들지 않는다. GitHub OIDC와 Google Cloud Workload Identity Federation을 사용한다.

- 백업 계정: Firestore 읽기 전용 권한만 부여
- 규칙 배포 계정: Firebase Rules 배포 권한만 부여
- GitHub 변수: `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_BACKUP_SERVICE_ACCOUNT`, `GCP_RULES_SERVICE_ACCOUNT`
- GitHub 비밀: 32자 이상 무작위 `BACKUP_ENCRYPTION_KEY`
- 사용 변수: `FIRESTORE_BACKUP_ENABLED=true`, `FIREBASE_SECURITY_AUTOMATION_ENABLED=true`

암호화 키는 저장소, 채팅, 로그에 입력하지 않는다. 키를 잃으면 백업을 복호화할 수 없으므로 GitHub 밖의 안전한 비밀번호 관리자에도 별도 보관한다.

## 자동 검증

워크플로는 내보낸 JSON 구조와 문서 수를 검사하고, 암호화 후 다시 복호화해 동일 검사를 통과한 경우에만 암호문을 업로드한다. 로컬 합성 데이터 테스트는 다음 명령으로 실행한다.

```bash
npm run test:backup
```

## 복구 안전장치

- 복구 스크립트는 기본 dry run이다.
- `--apply`와 정확한 `RESTORE_CONFIRM_PROJECT`가 모두 있어야 쓴다.
- 백업에 없는 기존 문서를 삭제하지 않는다.
- 실제 복원 전 읽기 전용 규칙을 적용하고 복원 범위·시각을 검토한다.
