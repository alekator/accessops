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

## Heavy screens

- `Users`: high row count + selection and bulk actions.
- `Audit`: infinite feed + expandable JSON payloads.
- `Roles`: dense permission matrix + revision workflow UI.

## Optimization decisions

- Query caching:
  - users list uses `placeholderData: keepPreviousData` to avoid jank while paging/filtering.
  - default query stale time is `60s`, with disabled refetch-on-focus for dashboard stability.
- Render cost:
  - users selection checks use memoized `Set` lookup (`O(1)` per row).
  - audit feed flattening is memoized by query data snapshot.
  - roles effective summary is memoized by policy draft.
- Network resilience:
  - bounded exponential retry delay for queries.
  - mutation retries disabled by default to avoid unintended repeated writes.

## Measurement commands

```bash
pnpm build
pnpm check:bundle
pnpm e2e
pnpm e2e:a11y
```

For local UX diagnostics:

- open DevTools Performance and record interactions on `/users`, `/audit`, `/roles`
- inspect web vitals logs in diagnostics panel during interaction flow

## Known trade-offs

- Table virtualization is not enabled yet; current row volumes are acceptable for demo scale.
- Diagnostics panel is dev-only and intentionally excluded from production behavior.
