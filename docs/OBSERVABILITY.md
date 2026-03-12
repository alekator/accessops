# Observability Notes

## What is implemented

- Structured client-side logging via `features/observability/model/client-logger.ts`.
- Performance telemetry (LCP, CLS, INP) via `WebVitalsObserver`.
- Connectivity notifications (offline/online toasts).
- Real-time event notifications (toasts + query invalidation).
- Query/mutation error telemetry via global TanStack Query caches.
- Request correlation IDs (`x-correlation-id`) for every API call.
- Error categorization for diagnostics (`auth`, `permission`, `validation`, `network`, `backend`).
- Dev diagnostics panel (development only) with live event stream and category filtering.

## Key logged domain events

- `auth_login_success`
- `auth_logout`
- `auth_role_switched`
- `user_updated`
- `role_policy_revision_proposed`
- `role_policy_revision_approved`
- `role_policy_revision_rejected`
- `role_policy_rolled_back`
- `role_policy_imported`
- `role_policy_exported`
- `query_error`
- `mutation_error`
- `api_request_failed`
- `api_request_network_error`
- `connectivity_offline`
- `connectivity_online`

## Planned production integration

- Add Sentry SDK for automatic error/performance capture.
- Route client logger output to remote sink (HTTP/log collector).
- Add distributed trace/span IDs compatible with backend tracing stack.
