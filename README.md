# Quant Trading — 공개 포트폴리오

Python 자동매매 연구·운영 시스템의 공개 설명과 모의 성과 대시보드입니다.
[사이트](https://quant-portfolio-eta.vercel.app) ·
[원본 JSON](https://quant-portfolio-eta.vercel.app/data/performance.json) ·
[측정 기준·검산](https://quant-portfolio-eta.vercel.app/measurement-notes.md)

## 데이터와 표시 기준

`public/data/performance.json`은 운영 서버의 모의 원장에서 생성한 공개 집계입니다.
목업이 아닙니다. 빌드 시 읽어 정적 HTML로 만들며 브라우저에 인증키를 전달하지 않습니다.
원장 자체나 실제 계좌 잔고·보유 내역은 공개하지 않습니다.

현재 패널은 `paper_epoch`의 같은 기간·계좌·비용 기준을 사용합니다. 필요한 필드가
없으면 빌드를 실패시킵니다. 과거 평생 통계는 별도 토글로 남깁니다.

- 수익률 = 종결 거래 순손익 / 유휴 계좌를 포함한 배정 시작 자본
- 최대낙폭은 시작 자본부터 계산하며 미청산 평가손익은 제외
- 승률 Wilson 구간과 50%의 비교는 수익성 판정이 아님
- KRW·USD를 분리하고 합계에만 명시된 고정 환율 적용
- 모의 체결·비용은 실거래 슬리피지나 유동성의 증거가 아님

## 실행과 검증

Node.js 22 이상 권장. API 키 없이 저장된 공개 데이터로 실행할 수 있습니다.

```bash
npm ci
node --test scripts/*.test.mjs
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

개발 화면은 `http://localhost:3000`입니다. `npm run build`는 데이터 검사 후
`out/`에 정적 파일을 생성합니다. Vercel은 main 변경을 배포합니다. 운영 서버의
정기 갱신은 같은 JSON 계약을 검증한 뒤 데이터만 갱신합니다.

회귀 검사는 초기 낙폭·기간 분리·미거래 계좌·시장별 필터·반올림·미완성 payload
차단을 확인합니다. 원장의 정확성과 거래 수익성 자체를 이 프론트엔드 검사로
증명하지 않습니다.

## 스택

Next.js App Router · React · TypeScript · Tailwind CSS · SVG charts.
한국어/영어, 키보드 차트 탐색, 시장 필터, 과거 통계 열람을 지원합니다.
