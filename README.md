# STELLINK v1.3.5 — 모바일 홈·멤버·방송 연결 개편

기존 v1.3.3/1.3.4 제공본에 적용하는 누적 업데이트입니다. GitHub와 Cloudflare에 자동 배포하지 않았습니다. 기존 개인 일정·공지·이미지·백업 형식은 유지합니다.

## 이번 변경
- 상단을 작은 기존 3D 심볼 + 워드마크 조합으로 변경.
- 치지직 팔로잉 화면을 참고한 가로 멤버 목록, LIVE 링과 태그, 전체/방송 중/예정 일정 필터.
- 프로필과 방송 제목 중심의 간결한 방송 목록. 긴 제목은 두 줄까지 노출.
- 달력의 날짜별 일정 카드와 멤버 일정에 사진 적용. 합방 사진 최대 3명 + 나머지 인원 표시.
- 사용자가 제공한 파트너 배지 PNG를 홈·멤버 목록·상세·일정·소식의 닉네임 옆에 표시.
- 긴 한글 제목과 메타데이터 줄바꿈 개선. 합방 기수 정보는 의미 단위로 줄바꿈.
- 홈에도 조회 상태와 다음 조회 카운트다운 제공. 조회 중/대기 중 버튼 구분.
- 자동 조회 시 가로 멤버 목록의 스크롤 위치와 펼친 목록 유지.
- 홈 멤버 클릭이 상세 화면으로 이동하도록 수정. 설정과 멤버 상세의 중복 등록 버튼 제거.
- 초기 화면은 모든 스크립트가 준비된 후 시작하도록 안정화.

## 적용 — GitHub
1. 기존 앱의 설정에서 전체 백업을 내려받습니다. 사이트 저장공간은 초기화하지 마세요.
2. 압축을 풀고 `github-update-only` 안의 파일을 아래 동일 경로에 업로드합니다. 폴더 이름 자체를 저장소에 올리지 않습니다.
3. 덮어쓰기 파일은 저장소 최상위, 배지 이미지는 assets/brand/에 넣습니다.
4. GitHub Pages 배포 완료 후 Brave에서 앱 및 관련 사이트 탭을 모두 닫고 다시 엽니다.
5. 설정의 스텔링크 정보가 v1.3.5인지 확인합니다.

| 작업 | GitHub 저장소 경로 |
|---|---|
| 덮어쓰기 | `app.js` |
| 덮어쓰기 | `chzzk-live.js` |
| 덮어쓰기 | `core.js` |
| 덮어쓰기 | `release-ui.css` |
| 덮어쓰기 | `release-ui.js` |
| 덮어쓰기 | `sw.js` |
| 추가 | `assets/brand/chzzk-partner.png` |

삭제·이동 파일은 없습니다. github/에는 전체 구성도 들어 있습니다. 직접 수정한 코드가 있다면 해당 파일은 먼저 비교하세요. 기존 로고 파일은 다시 올릴 필요가 없습니다.

## 적용 — Cloudflare Worker
이번 앱에 포함된 Worker는 v1.3.4입니다. 앱 v1.3.5와 버전 숫자가 다른 것은 정상입니다.
- 이미 Worker v1.3.4를 적용했다면 다시 바꾸지 않아도 됩니다.
- Worker가 v1.3.3.1 이하라면 cloudflare/worker-mobile.txt 전체로 기존 Worker 코드를 교체합니다. 읽기 쉬운 동일 소스는 worker.mjs입니다. 둘 중 하나만 사용하세요.
- 기존 CHZZK_CLIENT_ID / CHZZK_CLIENT_SECRET Secret은 유지합니다. GitHub에 비밀 값을 넣지 않습니다.
- Deploy 후 Active deployment를 확인합니다. 저장만 된 버전은 Promote version으로 활성화합니다.
- /health 응답 version=1.3.4, configured=true를 확인합니다. configured는 키 존재 여부입니다.
- cloudflare/ 파일은 GitHub Pages 업로드 대상이 아닙니다.

## API 동작 범위
v1.3.4 Worker는 임시 캐시에 다음 페이지를 저장하여 목록 조회를 이어갑니다. 이어 조회할 때 앞 3페이지도 재확인합니다. 기본 재조회 60초, 실패 120초, 조회 제한 300초입니다.
일부 목록만 확인되면 누락 채널은 OFF로 판정하지 않습니다. 전체 목록에서 발견되지 않은 경우에만 방송 중 아님으로 반환합니다. 목록 순위 변화, 조회 시간, 지역별 캐시 만료로 즉시 또는 항상 정확한 종료 판정을 보장하지 않습니다. 조회 묶음이 4분을 넘으면 새로 시작하고, 개별 방송 정보는 3분이 지나면 미확인으로 취급합니다.
기존 v1.3.3.1 Worker에도 앱이 연결되지만 scan_limit 문제는 Worker 업데이트 전까지 남습니다.

## 해상도와 배지
노트20 울트라 WQHD+ 1440×3088은 물리 해상도입니다. 웹 배치는 Brave의 CSS 화면 폭에 반응하도록 만들었습니다. 360px/412px 모바일 폭에서 검증했으며 화면 확대·글자 설정에 따라 배치가 달라질 수 있습니다. 1440px 고정 레이아웃을 사용하지 않습니다.
파트너 배지는 요청에 따라 등록된 14명에게 정적으로 표시합니다. 치지직 등급을 API로 조회하거나 자동 갱신하는 기능은 아닙니다. 새 로고를 생성한 것이 아니라 기존 로고와 제공된 배지 원본을 사용했습니다.

## 검증
- JavaScript 문법 및 HTML/서비스워커 파일 의존성 검사 통과.
- API 응답 검증, LIVE/OFF/unknown 전환, 오류·429 대기, 개인 데이터 보존 검사 통과.
- 45페이지 이어 조회, 상단 제목 변경, 커서 만료와 오류 처리 검사 통과.
- 브라우저에서 360px/412px 홈·일정 카드·멤버 상세 이동·설정과 큰 글자 설정 확인.
- 현재 운영 중인 Worker 응답이 새 앱 홈에 표시되는 것을 확인했습니다. 포함된 v1.3.4 Worker를 원격 배포한 것은 아닙니다.
- 갤럭시 실기기/Brave 앱 자체에서의 검증은 수행하지 않았습니다.

## 기존 유지 파일
- `assets/brand/stellink-apple-touch-180.png`
- `assets/brand/stellink-favicon-64.png`
- `assets/brand/stellink-icon-192.png`
- `assets/brand/stellink-icon-512.png`
- `assets/brand/stellink-logo-512.png`
- `assets/brand/stellink-maskable-512.png`
- `assets/brand/stellink-wordmark.png`
- `assets/members/hina.jpg`
- `assets/members/hiyori.png`
- `assets/members/huya.png`
- `assets/members/lize.png`
- `assets/members/mary.png`
- `assets/members/mashiro.jpg`
- `assets/members/nana.png`
- `assets/members/rang.png`
- `assets/members/riko.png`
- `assets/members/rin.png`
- `assets/members/shibuki.png`
- `assets/members/sources.json`
- `assets/members/tabi.jpg`
- `assets/members/toa.png`
- `assets/members/yuni.png`
- `breaks.js`
- `calendar-data.js`
- `calendar-model.js`
- `calendar-ui.js`
- `calendar.js`
- `data/calendar.json`
- `features.js`
- `icon-192.png`
- `icon-512.png`
- `icon.svg`
- `icons.js`
- `image-viewer.js`
- `index.html`
- `manifest.webmanifest`
- `members.js`
- `next-ui.css`
- `next-ui.js`
- `notices.js`
- `registration.js`
- `schedule.js`
- `storage.js`
- `style.css`
- `upgrade-ui.js`
- `view-state.js`
