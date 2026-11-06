# STELLINK v1.6.1 · 배지와 공지 작성 개선

v1.6.0 적용 사용자를 위한 수정판입니다. 기존 개인 일정·소식·이미지를 보존합니다.

## 이번에는 이렇게 올리세요
1. ZIP 압축을 풉니다.
2. `github-update-only/` 안의 내용물을 기존 앱의 index.html 위치에 같은 경로로 덮어씁니다. 폴더 자체를 추가하지 않습니다.
3. 새 파일 `registration-tools.js`를 index.html 옆에 추가합니다.
4. 공지용 `updates/v1.6.1/`과 `updates/v1.6.1/images/`를 만들고 파일을 올립니다. `updates/index.html` 및 `updates/latest/index.html`도 덮어씁니다.
5. 기존 앱에 새 버전 준비 알림이 뜨면 작성 내용을 저장한 뒤 적용합니다. 사이트 데이터를 삭제하지 않아도 됩니다.

이번 버전에서 삭제할 기존 파일은 없습니다. 워커 수정/재배포도 필요 없습니다.

| 폴더 | 용도 |
|---|---|
| github-update-only | v1.6.0 위에 적용할 변경 파일 + 파트너 배지 이미지 |
| github | 전체 웹앱. 변경 파일 방식 대신 사용할 수 있음 |
| cloudflare | 변경 없는 기존 v1.6.0 Worker. 참고/복구용, 다시 배포 불필요 |
| docs | 변경 목록·검증 안내. GitHub 업로드 불필요 |
| tests | 개발 테스트. GitHub 업로드 불필요 |

전체본과 변경본을 모두 올릴 필요는 없습니다. 기존 updates/v1.6.0/ 및 v1.5.0/ 기록은 유지하세요.
