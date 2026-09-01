# Quant Trading — 공개 포트폴리오

개인 자동매매 시스템의 공개 포트폴리오 + 실측치 대시보드. 소스는 비공개이므로,
코드 대신 작동 원리와 정직한 성과 실측치를 공개하는 정적 웹사이트입니다.

## 데이터 갱신 방식

모든 실측치는 `public/data/performance.json` 하나에서 나옵니다. 빌드 시
`src/lib/data.ts`가 이 파일을 **정적으로 import**합니다 — 런타임에 외부
API를 호출하지 않습니다(엔드포인트·키 노출 방지).

- 계약(타입)은 `src/types/performance.ts`에 고정되어 있습니다. 코드는 이
  계약만 신뢰합니다.
- 별도 파이프라인이 실거래 원장에서 이 파일을 생성해 교체합니다. 지금
  저장소에 커밋된 값은 **개발용 목업**이며, 실제 파이프라인이 붙기 전까지
  구조를 검증하기 위한 표본 데이터입니다.
- 값을 갱신하려면 `public/data/performance.json`을 계약에 맞게 교체하고
  다시 빌드하면 됩니다. 페이지 코드는 수정할 필요가 없습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 빌드

```bash
npm run build
```

`next.config.ts`에서 `output: "export"`로 설정되어 있어 서버리스 함수 없이
정적 파일(`out/`)로 빌드됩니다. Vercel에 그대로 올리면 됩니다.

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS v4. 차트는 외부 라이브러리
없이 인라인 SVG로 직접 그립니다.
