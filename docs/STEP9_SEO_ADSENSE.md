# STEP 9 SEO·AdSense 운영 메모

참조코드: `REF-DAILYFUN-STEP9-SEO-01`

## 자동 생성

- 공개된 정적 콘텐츠만 `index,follow`와 canonical을 사용합니다.
- 관리자, MY, 404, 결과 전용 URL, 미게시 슬롯은 `noindex`입니다.
- `sitemap.xml`에는 현재 공개된 URL만 들어갑니다.
- 목록 페이지에는 JavaScript 실행 전에도 이동 가능한 콘텐츠 링크가 포함됩니다.
- Organization, WebSite, WebPage/CollectionPage, BreadcrumbList JSON-LD를 생성합니다.

## 선택 환경변수

값이 없으면 관련 외부 스크립트와 인증값을 출력하지 않습니다.

- `PUBLIC_SITE_URL`: 기본값 `https://kpa100plus-debug.github.io/daily-test-lab`
- `GOOGLE_SITE_VERIFICATION`: Search Console 확인 토큰
- `GOOGLE_ANALYTICS_ID`: `G-`로 시작하는 실제 측정 ID
- `ADSENSE_CLIENT_ID`: `ca-pub-`로 시작하는 실제 AdSense 클라이언트 ID
- `ADSENSE_PUBLISHER_ID`: `pub-`로 시작하는 실제 게시자 ID

API 키, 비밀번호, 인증번호는 저장소에 넣지 않습니다. 공개가 전제된 Google 측정·게시자 ID만 GitHub Actions Variables로 설정합니다.

## 게시 후 수동 확인

1. Google Search Console에서 사이트 소유권을 확인합니다.
2. `sitemap.xml`을 제출하고 공개 URL 색인 상태를 확인합니다.
3. AdSense 승인 후에만 실제 게시자 ID와 광고 코드를 활성화합니다.
4. 유럽경제지역·영국·스위스 이용자에게 광고를 제공한다면 Google이 요구하는 인증 CMP를 별도로 설정합니다.

## GitHub Pages 경로 제한

현재 사이트는 `github.io/daily-test-lab/` 하위 경로에서 제공됩니다. 검색엔진의 표준 `robots.txt`와 AdSense `ads.txt`는 호스트 최상위 경로를 기준으로 확인될 수 있습니다. 실제 AdSense 신청 전에는 비용 0원의 전용 Cloudflare Pages 하위 도메인 또는 GitHub 사용자 사이트 최상위 주소로 연결하는 것이 안전합니다.

Firebase 관리자에서 새 슬롯을 게시해도 정적 sitemap과 초기 HTML 메타태그는 자동 변경되지 않습니다. 새 콘텐츠를 검색에 공개하려면 콘텐츠를 정적 원본에 동기화한 뒤 다시 빌드·배포해야 합니다.
