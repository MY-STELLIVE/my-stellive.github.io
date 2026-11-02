# STELLINK v1.3.6 — API 조회 안정화

v1.3.5 화면·로고·사진·파트너 배지를 유지하는 API 집중 업데이트입니다. 앱과 Worker 모두 v1.3.6입니다. 아직 사용자 GitHub/Cloudflare에 배포하지 않았습니다.

## 개선
- 캐시 응답을 받아도 매번 60초를 더 기다리던 방식에서, 서버의 남은 대기 시간(nextPollIn)에 맞춰 조회하도록 변경.
- 개별 방송 확인 시각을 보존. 캐시를 다시 받았다는 이유만으로 최신 확인 시각을 새로 만들지 않음.
- 앱이 이미 받은 응답보다 이전 시각인 결과, 비정상적으로 미래 시각인 결과를 거부.
- 인터넷 연결 끊김을 표시하고 온라인 복귀 시 재조회. 남아 있는 재시도 대기 제한은 준수.
- 서버의 Retry-After 숫자 또는 날짜 값을 반영. 최대 1시간 범위에서 안내된 시간에 맞춰 대기.
- Worker Cache API 읽기/쓰기 오류를 처리하고 동일 실행 인스턴스의 메모리 결과로 보완.
- 동일 실행 인스턴스에 동시에 들어온 요청은 한 번의 API 조회로 합침.
- 응답과 다음 페이지 진행 상태를 한 캐시 항목으로 저장.
- 조회 커서가 만료되면 미확인 상태로 두고 다음 요청부터 새 순회를 시작.
- 방송 종료는 연속 두 번의 전체 목록 조회에서 발견되지 않았을 때 확인. 그 사이 방송이 다시 발견되면 종료 후보를 해제.
- 연결 상세에 캐시 응답 여부, 생성 당시 경과 시간, 이번 API 요청 페이지 수 표시.

## GitHub 적용
압축의 github-update-only **안의 파일**을 저장소 최상위 동일 이름에 덮어씁니다. github-update-only 폴더 자체를 만들지 않습니다.

| 작업 | GitHub 저장소 경로 |
|---|---|
| 덮어쓰기 | `chzzk-live.js` |
| 덮어쓰기 | `core.js` |
| 덮어쓰기 | `release-ui.js` |
| 덮어쓰기 | `sw.js` |

추가·삭제·이동 파일 없음. 나머지 파일은 유지합니다. 기존 v1.3.5 미적용 상태라면 github/의 전체 파일을 기존 동일 경로로 올리면 됩니다. 전체 구성에는 기존 로고와 배지도 포함되어 있습니다.

## Cloudflare 적용 — 이번에는 Worker도 교체
1. 기존 앱 설정에서 전체 백업을 내려받습니다. 사이트 데이터는 삭제하지 않습니다.
2. Cloudflare → stellink-api → Edit code에서 기존 코드 전체를 cloudflare/worker-mobile.txt 내용으로 교체합니다.
3. worker.mjs는 동일한 코드의 읽기 쉬운 원본입니다. 두 파일 중 하나만 사용합니다.
4. CHZZK_CLIENT_ID / CHZZK_CLIENT_SECRET Secret 이름과 값을 그대로 유지합니다. 추가 바인딩이나 새 Worker는 필요 없습니다.
5. 배포 후 Active deployment가 새 버전인지 확인합니다. 저장만 된 경우 새 버전의 Promote version으로 활성화합니다.
6. /health의 version 1.3.6 및 configured true를 확인합니다. configured는 Secret 존재 여부이며 인증 성공 여부는 아닙니다.
7. GitHub 파일 업로드 및 Pages 배포 완료 후 Brave에서 앱·관련 사이트 탭을 모두 닫고 다시 엽니다. 앱 정보 v1.3.6과 연결 상세 서버 v1.3.6을 확인합니다.

cloudflare/는 GitHub Pages에 올리지 않습니다. tests/, README.md, FILE-MAP.json은 검증·안내용입니다.

## 응답 상태 의미
| 필드 | 의미 |
|---|---|
| scanState=continuing | 남은 목록을 다음 조회에서 이어서 확인 |
| scanState=complete | 이번 전체 목록 순회 완료 |
| pendingOffline | 종료 여부를 다음 전체 순회에서 다시 확인할 멤버 수 |
| nextPollIn | 응답 생성 시점부터 다음 조회까지 남은 초 |
| cacheSource=cache | 저장된 조회 결과를 반환함 |
| cacheAgeSeconds | 응답 생성 당시 기존 결과가 얼마나 오래됐는지 |
| state=unknown | 현재 ON/OFF를 확정하지 않음 |

## 정확성·운영 범위
종료 오판을 줄이는 대신 OFF 반영은 기존보다 늦을 수 있습니다. 라이브 목록은 조회 도중에도 순위와 내용이 바뀌므로, 두 번 확인하더라도 방송 종료의 절대적 보장은 아닙니다. 방송 시작과 제목 변경도 조회·캐시 간격의 영향을 받습니다.
Worker 캐시는 지역별이고 임시 저장입니다. 메모리 보완과 중복 요청 통합도 동일 실행 인스턴스 안에서만 작동합니다. 전 세계 단일 조회, 영구 상태 보관, 푸시 통지 기능은 아닙니다.
한 요청은 최대 35페이지, 약 18초 범위에서 조회합니다. 이어 조회할 때 앞 3페이지를 재확인합니다. 한 순회가 4분을 넘으면 새로 시작하며, 너무 긴 목록이나 느린 API에서는 전체 조회를 끝내지 못할 수 있습니다. 종료 후보 정보도 6분 이내의 상태만 이어갑니다. 상태가 사라지면 안전하게 미확인으로 돌아갑니다.
기본 갱신 60초, 실패 120초, 조회 제한은 최소 300초이며 서버 안내에 따라 길어질 수 있습니다. 새로고침으로 서버의 제한을 우회하지 않습니다.

## 검증
Node 기반 문법·의존성·버전 검사 및 기존 달력/기록/백업 검사를 통과했습니다. 추가 검증: 45페이지 이어 조회, 두 번의 전체 조회 후 OFF, 방송 재등장 시 종료 후보 해제, 커서 만료, 캐시 장애, 동시 요청 통합, 900초 Retry-After, 서버 지정 12초 재조회, 캐시 확인 시각 보존, 과거·미래 응답 거부, 오프라인 복귀.
이 버전의 원격 Worker 배포 및 실기기 검증은 수행하지 않았습니다.

## API 문서
- https://chzzk.gitbook.io/chzzk/chzzk-api/live
- https://developers.cloudflare.com/workers/runtime-apis/cache/

## 유지 파일
- `app.js`
- `assets/brand/chzzk-partner.png`
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
- `release-ui.css`
- `schedule.js`
- `storage.js`
- `style.css`
- `upgrade-ui.js`
- `view-state.js`
