# REF-DAILYFUN-STEP1-CONNECT-01 — GitHub·Firebase·Cloudflare 연결

## 1. GitHub

작업 폴더에서 실행합니다.

```bash
git init -b main
git config user.name "JU YOUNG KIM"
git config user.email "kpa100plus-debug@users.noreply.github.com"
git add .
git commit -m "chore: initialize DAILY TEST LAB zero-cost MVP"
```

GitHub CLI가 있는 PC에서는 다음을 실행합니다.

```bash
gh auth login --hostname github.com --git-protocol https --web
gh repo create daily-test-lab --private --source=. --remote=origin --push
```

## 2. Firebase Spark

Firebase CLI 설치 후 실행합니다.

```bash
npm install --global firebase-tools
firebase login
firebase projects:list
```

프로젝트는 Firebase 콘솔에서 다음 값으로 생성합니다.

- 프로젝트 이름: `DAILY TEST LAB`
- 요금제: `Spark (비용 없음)`
- Firestore: `Standard`, `(default)`, `asia-northeast3`, Production mode
- Web App 이름: `DAILY TEST LAB Web`
- Authentication: 이메일/비밀번호, Google, 익명만 활성화
- 비활성 유지: 전화 인증, Cloud Storage, Cloud Functions

Firebase 프로젝트 ID를 확인한 뒤 연결합니다.

```bash
firebase use --add
firebase deploy --only firestore
```

Firebase 콘솔의 웹 앱 설정에 표시되는 `firebaseConfig` 값을
`src/site/assets/js/firebase-config.js`에 입력합니다. 웹용 설정값은 비밀키가 아니며,
실제 보호는 `firestore.rules`가 담당합니다. 서비스 계정 JSON·Admin SDK 비밀키는 절대 저장소에 올리지 않습니다.

## 3. Cloudflare Pages

Cloudflare 대시보드에서 아래 순서로 연결합니다.

1. **Workers & Pages → Create application → Pages → Connect to Git**
2. GitHub 저장소 `daily-test-lab` 선택
3. Production branch: `main`
4. Build command: `npm test`
5. Build output directory: `dist`
6. Root directory: 비워 둠
7. **Save and Deploy**

Cloudflare가 빌드 시 제공하는 `CF_PAGES_URL`이 canonical, sitemap.xml,
robots.txt에 자동 반영됩니다. 별도의 유료 도메인이나 URL 환경변수는 필요하지 않습니다.

`Direct Upload`은 선택하지 않습니다. Git 자동배포 방식과 나중에 전환할 수 없기 때문입니다.

배포된 `프로젝트명.pages.dev` 주소를 Firebase Console의
**Authentication → Settings → Authorized domains**에 추가합니다.

## 4. 연결 확인

```bash
npm test
git add .
git commit -m "chore: connect Firebase and deployment settings"
git push
```

Cloudflare에서 새 배포가 성공하고 `/`, `/test/`, `/vote/`, `/game/`, `/admin/`이 모두 열리면 STEP 1 완료입니다.
