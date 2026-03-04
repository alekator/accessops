# Performance Budget

## Targets

- LCP: `< 2.5s`
- INP: `< 200ms`
- CLS: `< 0.1`

## Current mechanism

- Browser `PerformanceObserver` logs LCP/CLS/INP in client console.
- Budget overruns emit warning logs:
  - `performance_budget_lcp_exceeded`
  - `performance_budget_inp_exceeded`
  - `performance_budget_cls_exceeded`
- CI runs `pnpm check:bundle` after build:
  - total JS chunks budget: `<= 1500 KB`
  - largest single chunk budget: `<= 350 KB`

## Next step

- Add CI check for bundle size regression.
- Store metrics snapshots for trend comparison across releases.
