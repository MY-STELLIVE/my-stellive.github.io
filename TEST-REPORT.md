# 검증 결과 — v1.5.0

## 자동 검증

아래 10개 테스트 파일을 함께 실행했고 모두 통과했습니다.

```sh
node --test tests/v150.test.cjs tests/ui.test.cjs tests/v140.test.cjs tests/api-regression.cjs tests/cache-failure.test.mjs tests/client.test.cjs tests/live-state.test.cjs tests/metadata.test.mjs tests/relay.test.mjs tests/worker-routing.test.mjs
```

확인 범위:
- 이전 버전 백업/설정 이관, 다크 전환 후 글자 크기·움직임·달력 보기 보존
- 새 소식 분류·하트·연결 일정 필터, 제목/태그 HTML 이스케이프
- 홈 최대 3개 방송, 목록/카드 전환, 시청자 내림차순, 0명과 미확인 값 처리, 멤버 필터
- 일요일 시작 달력, 연도 경계, 1일 단위 이동, 기념일·기간 일정 표기
- 휴방 기준시각, 이후 실제 LIVE 충돌, 자정 넘긴 방송, KST 경과 시간
- 네트워크 실패·오래된 응답·미래 응답·부분 OFF 방어
- 캐시 장애, 동시 조회 병합, 인증 오류, 페이지 이어 조회, rate limit 대기, 두 번 전체 조회 후 OFF
- 전체 배포 JavaScript/Worker 문법, 서비스 워커 캐시 목록의 로컬 파일 존재
- Worker는 v1.4.2 패키지와 바이트가 동일

## 브라우저 검증

실제 배포 코드에 테스트 데이터를 공급하는 별도 페이지로 검증했습니다. 사용자 브라우저의 개인 데이터는 사용하지 않았습니다.

- 390px 모바일 프레임에서 하단 4탭, 홈, 라이브, 소식, 캘린더 표시
- 라이브 목록 상단 위치 157 CSS px, 가로 넘침 없음
- 가로 목록 → 큰 카드 전환, 방송 메뉴 → 상세 → 닫기
- 상세의 `9,348명 시청 중 · 01:00:00 스트리밍 중` 표시
- 방송이 없는 기수의 빈 목록 안내
- 소식 상세, 원본 이미지, 연결 일정, 분류 수정 후 저장
- 다크 전용 설정, 글자 크기/움직임 옵션 유지
- 캘린더 일 보기에서 다음날 이동 및 등록 날짜 반영
- 이미지 없는 일정 등록 → 저장 → 캘린더 복귀와 새 항목 표시

## 검증 한계

실제 Android Brave/PWA 기기 및 운영 치지직 응답으로 배포 후 검증한 결과는 아닙니다. 브라우저 UI 검증의 저장은 테스트용 메모리 저장소를 사용했고, 기존 IndexedDB 저장 코드는 유지했습니다. API 검증은 기존 회귀 테스트의 모의 응답을 사용했습니다.

`tests/browser-fixtures/`는 개발용 소스입니다. 배포할 `github/`, `github-update-only/`, 오프라인 캐시에 포함하지 않았습니다. `tests/baseline/browser-v132.cjs`는 이전 UI용 참고 자료이며 이번 실행 대상이 아닙니다.
