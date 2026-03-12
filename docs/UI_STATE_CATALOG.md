# UI State Catalog

## Goal

Provide Storybook-equivalent visual state coverage without introducing additional infrastructure.

Access path:

- `/roles?view=states`

The catalog is protected by the same auth/rbac model as dashboard routes.

## Covered States

- Users:
  - empty state
  - loading state
  - error state
- Roles:
  - read-only state
  - proposed revision action state
- Audit:
  - collapsed event item
  - expanded details state
- Connectivity and destructive action confirmation:
  - offline warning
  - destructive confirmation block

## Why This Approach

- Keeps visual state coverage close to production UI and existing architecture.
- Avoids lockfile churn and extra toolchain complexity.
- Supports product demos and QA checks from the same app runtime.

## Validation

- Playwright smoke test: `tests/e2e/ui-states.spec.ts`
- CI executes the full e2e suite, including this state catalog check.
