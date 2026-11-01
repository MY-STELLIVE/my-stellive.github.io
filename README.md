# STELLINK v1.3.1 · 통합 3D 로고 적용

선택한 연결된 두 별+궤도 로고를 그대로 사용했습니다. 이미지 디자인을 재생성하지 않고 웹용 크기로 변환했습니다.

## 적용 방법

- 이미 v1.3.0: github-update-only/ **안의 내용**을 기존 index.html이 있는 위치에 업로드합니다. assets/brand/ 폴더도 경로 그대로 추가합니다.
- 아직 v1.2.0: github/ **안의 전체 내용**을 같은 위치에 업로드하면 v1.3.0 기능과 v1.3.1 로고가 함께 적용됩니다.
- 두 폴더를 모두 올릴 필요는 없습니다. 폴더 이름 github 또는 github-update-only 자체를 사이트 경로에 추가하지 마세요.
- 기존 개인 데이터와 브라우저 저장소는 유지합니다. 사용 중인 같은 사이트 주소에서 업데이트하세요.
- Cloudflare Worker와 Secrets는 이번 로고 업데이트에서 변경하지 않습니다. cloudflare/는 전체본 참고용이며 이미 연결되어 있으면 다시 배포하지 않습니다.

## 반영 위치

앱 상단: 투명 로고+기존 STELLINK 워드마크 / 설정: 로고와 v1.3.1 / 브라우저 탭: PNG 아이콘 / 홈 화면: 192·512 아이콘 / Android 마스크 아이콘: 어두운 배경과 잘림 방지 여백 / Apple Touch: 180 아이콘.

## 새 GitHub 경로

기존 assets 폴더 안에 brand 폴더를 추가합니다. 정확한 상대 경로는 아래와 같습니다.

- `assets/brand/stellink-apple-touch-180.png`
- `assets/brand/stellink-favicon-64.png`
- `assets/brand/stellink-icon-192.png`
- `assets/brand/stellink-icon-512.png`
- `assets/brand/stellink-logo-512.png`
- `assets/brand/stellink-maskable-512.png`

## 덮어쓸 파일 (v1.3.0 기준)

- `app.js`
- `core.js`
- `index.html`
- `manifest.webmanifest`
- `next-ui.css`
- `sw.js`
- `upgrade-ui.js`

## 기존 유지 파일

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
- `chzzk-live.js`
- `data/calendar.json`
- `features.js`
- `icon-192.png`
- `icon-512.png`
- `icon.svg`
- `icons.js`
- `image-viewer.js`
- `members.js`
- `next-ui.js`
- `notices.js`
- `registration.js`
- `schedule.js`
- `storage.js`
- `style.css`
- `view-state.js`

삭제할 파일은 없습니다. 기존 icon.svg, icon-192.png, icon-512.png는 호환용으로 남아 있으며 활성 헤더·파비콘·manifest는 assets/brand의 새 로고를 참조합니다. 개인 추가 파일과 CNAME 등 기존 저장소 설정을 삭제하지 마세요.

## Brave 캐시와 설치 아이콘

GitHub Pages 배포가 끝나면 사이트를 한 번 열고, 스텔링크를 연 모든 Brave 탭과 홈 화면 앱 창을 닫았다가 다시 여세요. 새 서비스 워커 캐시는 v1.3.1입니다. 설정에 표시되는 v1.3.1과 로고로 적용 여부를 확인할 수 있습니다.

이미 설치한 홈 화면 아이콘은 Android/Brave의 별도 갱신 시점 때문에 앱 내부 로고보다 늦게 바뀔 수 있습니다. 아이콘 변경을 위해 사이트 데이터나 개인 기록을 삭제하지 마세요.

## 검증

자바스크립트 문법, 서비스워커 파일 포함, 전체 스크립트 통합 검사, 기존 데이터 백업·복원, v1.3.0→v1.3.1 설정 유지, PNG 실제 크기/투명 배경/manifest 경로를 검사했습니다. Android Brave 실기기와 설치 아이콘 자동 갱신은 직접 검증하지 않았습니다. 원격 배포는 사용자가 진행합니다.

v1.3.0 기능 상세와 공식 API 제한은 V1.3.0-기능안내.md를 참고하세요. API 즉시 푸시 전환이 추가된 버전이 아닙니다.
