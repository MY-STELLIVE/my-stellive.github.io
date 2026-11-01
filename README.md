# STELLINK v1.3.2 전체 업데이트

2026-11-01 · 기준 v1.3.1 · 개인용 STELLINK (MY STELLIVE와 별개)

## 지금 v1.3.1을 사용 중인 경우

1. 압축을 풉니다.
2. `github-update-only/` 안의 파일을 기존 GitHub의 `index.html`이 있는 위치에 같은 경로로 올립니다.
3. `assets/brand/stellink-wordmark.png`는 기존 `assets` → `brand` 폴더에 올립니다.
4. 나머지 패치 JS·CSS·HTML은 `index.html`과 같은 폴더에 올립니다.
5. GitHub Pages 배포가 완료되면 Brave에서 사이트를 한 번 열고, 스텔링크 앱과 관련 Brave 탭을 모두 닫았다가 다시 엽니다. 새 서비스 워커가 활성화됩니다.

`github-update-only` 또는 `github`라는 바깥 폴더 자체를 GitHub에 만들지 마세요. 두 폴더 중 하나의 **내용**만 올립니다.
이번에 새로 만들 폴더 경로는 없습니다. 기존 `assets/brand/`를 재사용합니다.

## 구버전에서 바로 적용하거나 전체 파일을 다시 올리는 경우

`github/` 안의 내용을 동일한 기존 사이트 위치에 올립니다. 하위 폴더 경로는 유지합니다.
기존 파일을 먼저 전부 삭제할 필요는 없습니다. 사이트 데이터·IndexedDB·브라우저 저장 공간을 삭제하지 마세요.

## 새로 추가한 파일 (3개)

- `assets/brand/stellink-wordmark.png`
- `release-ui.css`
- `release-ui.js`

## 기존 파일 덮어쓰기 (7개)

- `calendar-ui.js`
- `chzzk-live.js`
- `core.js`
- `index.html`
- `notices.js`
- `sw.js`
- `upgrade-ui.js`

## 기존 유지 파일 (42개)

- `app.js`
- `assets/brand/stellink-apple-touch-180.png`
- `assets/brand/stellink-favicon-64.png`
- `assets/brand/stellink-icon-192.png`
- `assets/brand/stellink-icon-512.png`
- `assets/brand/stellink-logo-512.png`
- `assets/brand/stellink-maskable-512.png`
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
- `calendar.js`
- `data/calendar.json`
- `features.js`
- `icon-192.png`
- `icon-512.png`
- `icon.svg`
- `icons.js`
- `image-viewer.js`
- `manifest.webmanifest`
- `members.js`
- `next-ui.css`
- `next-ui.js`
- `registration.js`
- `schedule.js`
- `storage.js`
- `style.css`
- `view-state.js`

삭제할 파일: 없음.
`README.md`, `FILE-MAP.json`, `tests/`는 안내·검증용이므로 GitHub Pages에 올릴 필요가 없습니다.

## 변경 내용

- 확정한 은백색·라벤더 3D 워드마크를 상단과 앱 정보에 적용. 기존 앱 아이콘 보존. 밝은 테마에서는 짙은 바탕으로 대비 확보.
- 탭: 홈 / 캘린더 / 멤버 / 설정. 제목: 오늘의 스텔링크 / 스텔라 캘린더 / 스텔라 멤버 / 나의 스텔링크.
- 월간·주간 달력 일요일 시작~토요일 끝. 공지의 주간 시간표 원본 주차 계산은 기존대로 보존.
- 날짜 배경: 주말·공휴일, 방송, 기념일, 행사, 단일 선택 멤버의 휴방 구분. 오늘 배지와 선택일 테두리 분리.
- 겹침 우선순위: 기념일 > 행사 > 방송 > 주말·공휴일. 단일 멤버 휴방은 방송이 없을 때 휴방색. 공휴일 날짜 숫자의 붉은색은 유지.
- 전체 화면에서는 휴방이 있는 날짜에 휴방 개수를 표시하고 전체 휴방으로 칠하지 않음.
- 멤버 필터 중에도 공휴일은 유지. 종류 필터에서 공휴일을 제외하면 숨김.
- 날짜 칸에는 종류·개수, 아래에는 선택일의 상세 일정. 기간 막대 2줄+더보기.
- 등록 버튼을 고정 플로팅에서 화면 위쪽 일반 버튼으로 이동하여 목록·날짜 가림 제거.
- 홈 소식 3개, 전체 소식은 날짜별 목록. 멤버 프로필·제목·썸네일·하트·연결 일정 표시.
- 이미지 장수는 2장 이상일 때만 표시. 수정본·정보 수정 표시. 검색·멤버·읽음·기간·유형 필터.
- 제목=상세, 썸네일=이미지 확대, 하트=직접 읽음 기록, 일정 버튼=연결 일정. 공지를 여는 것만으로 읽음 변경하지 않음.
- 상세의 편집 기능은 관리 메뉴로 정리. 기존 목록 필터와 스크롤 보존.
- 미확인 채널을 OFF에 포함하지 않음. `undefined페이지` 등 내부 처리 문구 제거.
- 현재 방송 중이 아닌 상태와 관측된 방송 종료를 구분. 요청 실패·오래된 데이터는 확인 불가/갱신 지연.
- 홈에는 마지막 정상 확인 시각. 설정은 화면 꾸미기 / 캘린더 설정 / 방송 연결 / 내 기록 관리 / 스텔링크 정보.
- 기존 일정·이미지·하트·필터·개인 메모·설정·백업 데이터 보존.

## 치지직 / Cloudflare

이번 버전에서 Cloudflare Worker 코드는 v1.3.1 통합본과 동일합니다.
이미 공식 Worker를 적용했다면 다시 교체하지 않아도 됩니다.
이전 실험용 `direct-unofficial` Worker를 사용하거나 모든 멤버가 `connection_or_json_error`이면, 포함된 `cloudflare/worker-mobile.txt`로 기존 Worker 코드를 **전체 교체**하고 최신 버전을 활성화하세요.

- Worker: `stellink-api`
- 환경 Secret: `CHZZK_CLIENT_ID`, `CHZZK_CLIENT_SECRET` (기존 값 유지, 코드/GitHub에 넣지 않음)
- 연결 주소: `https://stellink-api.a01086042610.workers.dev/live`
- 코드 저장 후 Deployments의 해당 최신 버전을 Promote하여 Active / 100%인지 확인
- 공식 Worker 루트 응답: `STELLINK Chzzk relay`, 버전 `1.0.0`

연동은 화면이 보일 때 기본 60초 간격으로 조회합니다. 서버 캐시·목록 순회·응답 지연에 따라 더 늦어질 수 있고 즉시 푸시 방식이 아닙니다.
공식 전체 라이브 목록을 순회해 14명 채널을 골라내는 방식입니다. 조회가 불완전하면 빠진 멤버를 OFF로 단정하지 않습니다.
새 UI를 설치하는 것만으로 치지직 서버 연결 성공이 보장되지는 않습니다. 실제 계정 Secret·배포·API 응답은 별도입니다.

## 검증 및 한계

- 21개 JS 문법과 HTML/SW 의존 파일 확인
- 기존 Core 22개, 달력 9개 시나리오 통과
- Worker 모의 응답 8개 시나리오 통과 (Worker 변경 없음)
- 실제 LIVE → OFF, 조회 실패와 unknown 처리, 개인 일정 무변경 검증
- 일요일 시작·연말 경계·주간 범위·겹친 기간 일정·휴방/공휴일 필터 검증
- 새 소식 목록의 제목 이스케이프·읽음 필터·v1.3.1 설정 보존 및 백업 검증
- 실제 Galaxy/Brave 렌더링 및 실제 치지직 API 통신 성공은 이 환경에서 검증하지 못했습니다. 브라우저 테스트 파일은 참고용이며 통과로 표시하지 않았습니다.

버전별 패치를 순서대로 설치할 필요 없이 이 통합본만 사용하면 됩니다.
