# STELLINK v1.6.0

기존 v1.5.0 패키지를 기반으로 구현한 소식·일정·라이브 연결 업데이트입니다.

## 먼저 읽기
1. 현재 앱 설정에서 개인 기록을 JSON으로 백업합니다. 기존 GitHub 배포 커밋과 Worker 코드도 보관합니다.
2. `docs/DEPLOY.md`를 읽고 Cloudflare Worker를 업데이트합니다. 기존 환경변수/비밀값은 그대로 유지합니다.
3. GitHub Pages 소스 위치에 `github/` 안의 **내용물**을 덮어씁니다. github 폴더 자체를 새 하위 폴더로 올리지 마세요.
4. 기존 v1.5.0에서 변경 파일만 적용한다면 `github-update-only/` 내용물을 같은 위치에 덮어써도 됩니다. 두 폴더를 모두 업로드할 필요는 없습니다.
5. `docs/DELETE-FILES.txt`의 4개 구형 파일만 새 버전 정상 확인 뒤 삭제합니다.
6. 앱을 새로 열고 설정 버전, 통합 등록, 라이브/오프라인, 공지를 확인합니다.

## 폴더 구분
| 폴더 | 용도 | GitHub Pages 업로드 |
|---|---|---|
| github | 전체 웹앱 및 버전별 공지 | 예 |
| github-update-only | v1.5.0 대비 신규/수정 파일만 | 전체본 대신 선택 |
| cloudflare | Worker 실행 코드와 모바일 복사용 텍스트 | 아니요, Cloudflare에 적용 |
| docs | 적용·삭제·변경·테스트 안내 | 실행에 불필요 |
| tests | 개발 검증 코드 | 실행에 불필요 |

`docs/CHANGELOG.md`에 구현 내용과 남은 범위를, `docs/FILE-MAP.json`에 변경 파일 및 해시를 기록했습니다.
