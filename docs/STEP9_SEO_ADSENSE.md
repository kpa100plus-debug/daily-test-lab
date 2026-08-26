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

- `PUBLIC_SITE_URL`: 기본값 `https://dtlabkr.dpdns.org`
- `GOOGLE_SITE_VERIFICATION`: Search Console 확인 토큰
- `GOOGLE_ANALYTICS_ID`: `G-`로 시작하는 실제 측정 ID
- `ADSENSE_CLIENT_ID`: `ca-pub-`로 시작하는 실제 AdSense 클라이언트 ID
- `ADSENSE_PUBLISHER_ID`: `pub-`로 시작하는 실제 게시자 ID
- `ADSENSE_CONTENT_SLOT_ID`: 콘텐츠 사이 광고 단위의 숫자 ID
- `ADSENSE_RESULT_SLOT_ID`: 결과 하단 광고 단위의 숫자 ID
- `ADSENSE_FOOTER_SLOT_ID`: 페이지 하단 광고 단위의 숫자 ID

API 키, 비밀번호, 인증번호는 저장소에 넣지 않습니다. 공개가 전제된 Google 측정·게시자 ID만 GitHub Actions Variables로 설정합니다.

## 게시 후 수동 확인

1. Google Search Console에서 사이트 소유권을 확인합니다.
2. `sitemap.xml`을 제출하고 공개 URL 색인 상태를 확인합니다.
3. AdSense에서 발급한 실제 게시자 ID와 광고 단위 ID만 GitHub Actions Variables에 등록합니다.
4. 유럽경제지역·영국·스위스 이용자에게 광고를 제공한다면 Google이 요구하는 인증 CMP를 별도로 설정합니다.

실제 ID가 없으면 빌드 결과에 광고 스크립트, 광고 단위, `ads.txt`가 생성되지 않습니다. 승인 전 빈 광고 상자도 공개하지 않습니다. `ADSENSE_CLIENT_ID`만 설정하면 사이트 확인용 코드가 `<head>`에 들어가고, 각 광고 단위는 해당 슬롯 ID까지 설정된 경우에만 활성화됩니다.

## 현재 AdSense 신청 차단 요인

현재 사이트는 `https://dtlabkr.dpdns.org/` 하위 경로에서 제공됩니다. Google 공식 안내상 AdSense 신청 URL에는 경로가 포함될 수 없고, `ads.txt`도 사이트 호스트의 최상위 경로에 있어야 합니다. 따라서 현재 주소는 검색·기능 테스트에는 정상이나 AdSense 사이트 신청 주소로는 사용할 수 없습니다.

비용 0원을 절대 유지한다면 Google이 명시한 호스트 파트너인 Blogger를 수익화 진입 주소로 구성해야 합니다. 자체 도메인을 연결하면 현재 정적 앱 구조를 그대로 유지하기 쉽지만 도메인 비용이 발생하므로 현재 조건에서는 보류합니다. 어느 경로든 Google 계정 로그인, 지급 정보 확인, 사이트 제출과 CMP 설정은 계정 소유자가 직접 완료해야 합니다.

Firebase 관리자에서 새 슬롯을 게시해도 정적 sitemap과 초기 HTML 메타태그는 자동 변경되지 않습니다. 새 콘텐츠를 검색에 공개하려면 콘텐츠를 정적 원본에 동기화한 뒤 다시 빌드·배포해야 합니다.
