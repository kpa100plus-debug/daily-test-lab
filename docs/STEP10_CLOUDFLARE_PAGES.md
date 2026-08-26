# STEP 10 배포 기록

참조코드: `REF-DAILYFUN-STEP10-CLOUDFLARE-PAGES-02`

## 현재 배포 설정

- Git 저장소: `kpa100plus-debug/daily-test-lab`
- Production branch: `main`
- GitHub Actions 빌드: `node scripts/build.mjs`
- Build output directory: `dist`
- 실제 공개 주소: `https://dtlabkr.dpdns.org/`

Cloudflare Pages 연결은 반복 보안 확인 문제로 운영 경로에서 제외했습니다. GitHub Pages를 단일 배포 경로로 사용하며 canonical, sitemap.xml, robots.txt도 동일 주소를 가리킵니다.

## 배포 직후 확인

다음 경로가 모두 정상 응답해야 합니다.

- `/`
- `/test/`
- `/vote/`
- `/game/`
- `/admin/`
- `/robots.txt`
- `/sitemap.xml`

현재 GitHub Pages 프로젝트 경로는 AdSense 신청 URL 요건을 충족하지 않습니다. 비용 0원 유지 시 Blogger 호스트 파트너 경로를 별도로 구성하고, 실제 AdSense 게시자 ID가 발급된 뒤에만 광고 코드와 `ads.txt`를 활성화합니다. 비밀번호, 인증번호, API 키는 저장소에 기록하지 않습니다.

© 2026 ISEA GROUP. All rights reserved.
