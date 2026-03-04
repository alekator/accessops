# Security Notes

## Scope

This project is a frontend portfolio demo with mocked APIs.

## Important constraints

- UI RBAC is a UX-level guard only. It does **not** replace backend authorization.
- Real deployments must enforce permissions server-side for every protected action.
- Local/session storage values are untrusted input in real systems.

## Current defensive measures

- Runtime response validation with Zod in API client paths.
- JSON policy import validation with strict schema checks.
- Error paths return typed/structured messages.

## Recommended hardening for production

- HttpOnly secure cookies + server session validation.
- CSRF protection for state-changing requests.
- Content security policy and stricter headers.
- Server-side audit signatures / tamper detection.
