# Measurement notes / 측정 기준

Updated: 2026-09-29. The current data timestamp is `generated_at` in
[/data/performance.json](/data/performance.json).

## Current record

- Current panels use `paper_epoch`: assigned independent paper accounts since the reset.
- Starting capital includes idle assigned accounts. KRW and USD stay separate; the combined account uses the fixed FX rate disclosed in the payload.
- Returns are cumulative **closed-trade realized net P&L / allocated initial capital**. They exclude open-position valuation. Drawdown includes the original starting capital as the first peak.
- Current strategy statistics, curves, costs and header use the same period and population. No-trade accounts have zero realized P&L and no estimated win rate or expectancy.
- The Wilson 95% interval tests whether the win rate is above/below 50%. It does not test profitability, alpha, or the mean return. A strategy can win rarely and still have positive expectancy.
- Paper fills and costs use configured assumptions. They do not establish achieved live slippage or liquidity.
- If gross P&L is zero, cost / absolute gross P&L is unavailable. If gross is small, that ratio can be very large. Read costs and net P&L alongside it.
- Historical lifetime statistics are a separate record. Research verdicts are manually maintained findings; rejected ideas may still run as explicit paper observation lanes.
- No benchmark-relative return, expectancy confidence interval, or live profitability claim is made.

## 현재 기록

현재 화면은 `paper_epoch`의 같은 기간·배정 계좌를 사용합니다. 미청산 평가손익은
제외하고 유휴 배정 자본은 포함합니다. 따라서 전체 계좌 평가액이나 전체 위험을
나타내지 않습니다. 최대낙폭에는 시작 자본과 첫날 손실을 포함합니다.

승률 50%와의 비교는 수익성 판정이 아닙니다. 종결 거래가 없는 계좌는 실현손익
0과 추정 불가 통계를 구분합니다. 과거 통계와 연구 기각 이력은 별도로 보존합니다.
실험용 AI 레인과 오버나이트 관찰 전략도 존재하며, 거래 루프 안에서 LLM을 직접
호출하지 않는 경계와 구분해 설명합니다.

## Reproduce current totals without credentials

Python 3, standard library only. Downloads the already-public payload; sends no orders.

```python
import json
from urllib.request import urlopen

url = 'https://quant-portfolio-eta.vercel.app/data/performance.json'
with urlopen(url) as response:
    data = json.load(response)
epoch = data['paper_epoch']
print('Generated:', data['generated_at'], 'Period:', epoch['period'])
print('Closed trips:', sum(s['total']['trips'] for s in epoch['strategies']))
for name in ('equity_asia', 'equity_us'):
    book = epoch[name]
    latest = book['rows'][-1]['cum_pct'] if book['rows'] else None
    values = [1.0] + [1 + r['cum_pct'] / 100 for r in book['rows']
                      if r['cum_pct'] is not None]
    peak, drawdown = 1.0, 0.0
    for value in values:
        peak = max(peak, value)
        drawdown = max(drawdown, (peak - value) / peak)
    print(name, 'capital:', book['seed'], 'return %:', latest,
          'realized drawdown %:', round(drawdown * 100, 4))
```

## September 29 corrections

The previous headline divided post-reset trades by a legacy seed. Current panels now
use the account reset consistently. Old lifetime curves no longer substitute for
missing current accounts. Win-rate labels describe the test actually performed.
Drawdown starts from initial capital. These changes correct measurement and display;
original fills and research rejections are preserved.

## Engineering evidence

The engine enforces dependency boundaries through import-graph tests. Integration tests
exercise strategy, risk, paper execution and account changes. Publication checks the
payload contract and reconciles independently calculated ledger statistics. These
checks support data consistency; they do not prove strategy profitability. The trading
repository is private; this public payload is the reproducible evidence for the page.
