# STELLINK v1.3.3 — 공식 API 연결 안정화

기준: 제공했던 v1.3.2 완성본. 현재 GitHub 배포본 전체와의 동일성은 확인하지 않았습니다.
2026-11-01 공개 Worker /live를 직접 조회했을 때 mode=direct-unofficial, 14명 모두 unknown, connection_or_json_error였습니다. 이번 패키지는 이 구형 Worker를 공식 API 방식으로 교체하도록 준비했습니다. 원격 배포는 아직 하지 않았습니다.

## 적용 순서 — Cloudflare 교체가 필수입니다
1. 앱 설정에서 개인 기록 백업을 먼저 내려받습니다. 사이트 데이터는 삭제하지 마세요.
2. Cloudflare → stellink-api → Edit code → 기존 코드를 모두 지웁니다.
3. cloudflare/worker-mobile.txt의 한 줄 전체를 붙여넣습니다. 코드 블록 표시나 파일명을 함께 넣지 마세요. worker.mjs는 같은 코드의 읽기 쉬운 원본이므로 둘 중 하나만 사용합니다.
4. Settings의 Secret 이름 CHZZK_CLIENT_ID / CHZZK_CLIENT_SECRET을 유지합니다. 값은 GitHub나 코드에 넣지 않습니다. 이전에 노출한 Secret을 아직 재발급하지 않았다면 재발급 후 Cloudflare 값도 교체하세요.
5. Deploy 후 Deployments의 Active deployment가 새 버전인지 확인합니다. 저장만 된 경우 새 버전의 메뉴에서 Promote version으로 활성화합니다.
6. https://stellink-api.a01086042610.workers.dev/health 에서 version=1.3.3, mode=official-list, configured=true를 확인합니다. configured는 키 존재 여부이며 인증 성공 여부가 아닙니다.
7. https://stellink-api.a01086042610.workers.dev/live 에서 결과를 확인합니다. mode=direct-unofficial이면 아직 옛 Worker입니다.
8. GitHub에는 아래 표의 파일을 업로드합니다. v1.3.2 사용자는 github-update-only 안의 파일을 저장소 최상위 동일 경로에 덮어씁니다. 이전 버전이거나 적용 상태가 불명확하면 github 안의 전체 내용을 동일 경로에 업로드합니다. github 폴더 자체를 만들지 않습니다.
9. 업로드가 끝나면 GitHub Pages 배포 완료 후 Brave의 앱/사이트 탭을 모두 닫고 다시 엽니다. 업데이트 안내가 있으면 적용합니다. 개인 기록이 들어 있는 사이트 저장공간을 초기화하지 않습니다.

## GitHub 파일 변경표
이번에는 새 경로·추가 파일·삭제 파일이 없습니다. 경로 재편은 API 정상화 이후 별도 진행합니다.

| 분류 | 저장소 경로 | 변경 내용 |
|---|---|---|
| 덮어쓰기 | `chzzk-live.js` | 구형 Worker 감지, 안전한 상태 판정, 재시도 제한 준수 |
| 덮어쓰기 | `core.js` | 1.3.3 버전 및 기존 데이터 보존 |
| 덮어쓰기 | `next-ui.js` | 조회 대기 안내 개선 |
| 덮어쓰기 | `release-ui.js` | 오류별 원인 안내 및 서버 버전 표시 |
| 덮어쓰기 | `sw.js` | 캐시 버전 갱신 및 화면 복구 경로 수정 |

### 기존 유지 파일 (v1.3.2 기준)
- `app.js`
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
- `notices.js`
- `registration.js`
- `release-ui.css`
- `schedule.js`
- `storage.js`
- `style.css`
- `upgrade-ui.js`
- `view-state.js`

## Cloudflare 전용 파일
- cloudflare/worker.mjs: 기존 Worker 소스 전체 교체.
- cloudflare/worker-mobile.txt: 위 코드의 휴대폰 붙여넣기용 한 줄 버전.
- 이 두 파일은 GitHub Pages에 업로드하지 않습니다. 새 Worker 생성도 필요 없습니다.
- tests/, README.md, FILE-MAP.json은 검증/안내용이며 앱 배포 필수 파일이 아닙니다.

## 응답별 해석
| 응답 | 의미와 조치 |
|---|---|
| mode=official-list | 이번 공식 조회 방식 |
| reason=missing_secrets | Cloudflare Secret 이름/존재 확인 |
| reason=authentication_failed | 인증 거절: 키 값과 앱 상태 확인 |
| reason=rate_limited | 요청 제한: 5분 대기 |
| reason=scan_limit | 페이지/시간 한도: 찾은 방송만 반영, 나머지는 unknown |
| reason=connection_error 또는 timeout | 외부 연결 또는 시간 초과: 종료로 판단하지 않음 |
| complete=true | 목록 끝까지 확인한 조회. 미발견 채널은 방송 중 아님 |
| complete=false | 전체 확인 안 됨. 미발견 채널은 확인 불가 |

공식 API는 전체 라이브 목록을 페이지당 최대 20개 조회합니다. 채널 ID를 지정한 공식 개별 상태 API로 바꾸는 패치가 아닙니다. 최대 40페이지/약 20초 탐색으로 제한하며, 이 한도 때문에 일부 채널은 unknown일 수 있습니다. 목록은 조회 중에도 변할 수 있어 즉각적·원자적인 시작/종료 판정은 아닙니다.
화면 표시 중 기본 60초 간격, 실패 후 120초, 제한 후 300초입니다. 서버 캐시와 조회 시간으로 지연이 더해질 수 있습니다. 앱을 닫은 동안 계속 추적하거나 알림을 보내지 않습니다.

## 유지되는 기능과 데이터
기존 로고/워드마크, 일~토 달력, 소식 UI, 개인 일정·이미지·하트·설정, 저장소 이름은 유지합니다. API 결과는 개인 일정을 덮어쓰지 않습니다. 전체 앱 ZIP은 개인 기록 백업을 포함하지 않습니다.

## 검증 범위
JS 문법/파일 연결/캐시 목록, 공식 API 모의 응답의 페이지 처리·인증 오류·429·JSON 오류·시간 초과, 구형 Worker 감지, 숨겨진 탭, 수동 새로고침 대기 준수, 불완전 OFF 응답 거부, 상태 전환, 데이터 백업/복원 및 달력 회귀 검증을 수행했습니다.
실제 새 Worker 인증 성공과 Android Brave UI는 이 환경에서 검증하지 않았습니다. 공식 API 연결 성공으로 보고한 버전이 아니라 배포 가능한 수정본입니다.

## 복구
개인 데이터를 삭제하지 않고 이전 전체 앱 파일을 다시 업로드할 수 있습니다. 단, 이전 sw.js의 캐시 버전도 복구 전용 새 이름으로 바꿔 재배포해야 합니다. Worker는 Deployments에서 필요한 이전 버전을 활성화할 수 있으나, 확인된 비공식 구버전으로 돌아가면 동일 조회 오류가 재발할 수 있습니다.

참고 문서: https://chzzk.gitbook.io/chzzk/chzzk-api/live
