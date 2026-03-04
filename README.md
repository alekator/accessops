# AccessOps Dashboard

Production-grade Next.js + React admin dashboard focused on RBAC workflows, enterprise tables/forms, audit visibility, and real-time UX.

The project is frontend-first: all API and WebSocket behavior is mocked with MSW/event-bus so the demo works without a backend.

## Key Features

- Mock authentication with roles: `Admin`, `Manager`, `Viewer`
- RBAC route protection and role-based read-only/edit behavior
- Users module with server-like pagination/filter/sort and URL-synced state
- User details and edit form with dynamic validation and optimistic rollback
- Roles permission matrix (cell/row/column/all toggle) with diff + JSON import/export
- Audit log with infinite scroll, filters, expandable event JSON, and CSV export
- Real-time event simulation (auto + manual trigger) with query cache invalidation
- Offline banner, connectivity toasts, retry policy, and dashboard error boundary

## Tech Stack

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui primitives
- TanStack Query
- React Hook Form + Zod
- MSW (REST mocking) + custom WS event bus
- Vitest + Testing Library
- Playwright E2E
- ESLint + Prettier + Husky + lint-staged
- GitHub Actions CI

## Architecture

```text
src/
  app/                  # routes and layouts
  entities/             # domain models + entity API
    user/
    role/
    audit/
  features/             # cross-entity business features
    auth/
    users/
    roles/
    audit/
    realtime/
    connectivity/
    observability/
  widgets/              # composed UI blocks/shells
  shared/               # api client, hooks, utils, types
  mocks/                # fixtures, handlers, ws, in-memory db
tests/
  e2e/
```

## Local Setup

```bash
pnpm install
pnpm dev
```

Open: `http://localhost:3000`

Demo accounts:

- `admin@accessops.dev / demo123`
- `manager@accessops.dev / demo123`
- `viewer@accessops.dev / demo123`

## Testing & Quality

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```

## Mocking Model

- REST endpoints are versioned and provided by MSW handlers (`/api/v1/users`, `/api/v1/roles`, `/api/v1/audit`, etc.).
- Data is served from deterministic in-memory fixtures (`users: 200`, `audit events: 500+`, `roles: 3`).
- Real-time updates are simulated via client event-bus (`mocks/ws`) with:
  - timed auto-events in dev
  - "Simulate event" button in dashboard header

## 5-Minute Demo Script

1. Login as `admin@accessops.dev`.
2. Open `/users`, apply filters/sort/search, verify URL updates.
3. Open `/users/usr_001/edit`, change fields, save, observe optimistic UX.
4. Open `/roles`, toggle matrix values, inspect diff, export/import JSON, save.
5. Open `/audit`, filter by `usr_001` and action, expand JSON details, export CSV.
6. Trigger `Simulate event` in header and observe toast + fresh data.

## Observability / Performance / Security

See detailed docs:

- [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md)
- [`docs/PERFORMANCE_BUDGET.md`](docs/PERFORMANCE_BUDGET.md)
- [`docs/SECURITY_NOTES.md`](docs/SECURITY_NOTES.md)
- [`docs/RELEASE_PROCESS.md`](docs/RELEASE_PROCESS.md)

## Screenshots

- `docs/screenshots/login.png` (placeholder)
- `docs/screenshots/users-table.png` (placeholder)
- `docs/screenshots/roles-matrix.png` (placeholder)
- `docs/screenshots/audit-log.png` (placeholder)

## CI

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs:

- lint
- typecheck
- unit tests
- build
- bundle budget check
- Playwright E2E

## Roadmap

- Add Sentry SDK wiring for production deployments
- Add explicit `/api/v1/*` contract namespace
- Expand e2e matrix (Manager/Viewer flows and RBAC negative scenarios)
- Add performance regression gate in CI (bundle stats + thresholds)
