# STEP 10 Cloudflare Pages 무료 배포

참조코드: `REF-DAILYFUN-STEP10-CLOUDFLARE-PAGES-02`

## 배포 설정

- Git 저장소: `kpa100plus-debug/daily-test-lab`
- Production branch: `main`
- Framework preset: `None`
- Build command: `npm test`
- Build output directory: `dist`
- Root directory: 비워 둠

Cloudflare Pages가 자동 주입하는 `CF_PAGES_URL`을 운영 URL로 사용합니다.
따라서 최초 배포부터 canonical, sitemap.xml, robots.txt가 실제 `pages.dev`
주소를 가리킵니다. GitHub Pages 빌드에서는 기존 `/daily-test-lab/` 경로를 유지합니다.

## 배포 직후 확인

다음 경로가 모두 정상 응답해야 합니다.

- `/`
- `/test/`
- `/vote/`
- `/game/`
- `/admin/`
- `/robots.txt`
- `/sitemap.xml`

`pages.dev` 호스트명을 Firebase Console의 Authentication → Settings →
Authorized domains에 추가합니다. AdSense 승인 후에만 실제 게시자 ID를 설정해
최상위 `/ads.txt`를 생성합니다. 비밀번호, 인증번호, API 키는 저장소에 기록하지 않습니다.

© 2026 ISEA GROUP. All Rights Reserved.
