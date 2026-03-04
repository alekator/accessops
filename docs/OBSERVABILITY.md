# Observability Notes

## What is implemented

- Structured client-side logging via `features/observability/model/client-logger.ts`.
- Performance telemetry (LCP, CLS, INP) via `WebVitalsObserver`.
- Connectivity notifications (offline/online toasts).
- Real-time event notifications (toasts + query invalidation).

## Key logged domain events

- `auth_login_success`
- `auth_logout`
- `auth_role_switched`
- `user_updated`
- `role_policy_saved`
- `role_policy_imported`
- `role_policy_exported`

## Planned production integration

- Add Sentry SDK for automatic error/performance capture.
- Route client logger output to remote sink (HTTP/log collector).
- Add trace/span correlation IDs for API calls.
