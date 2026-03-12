# Accessibility Notes

## Scope

This project follows practical accessibility rules for enterprise admin workflows.

## Implemented Baseline

- Keyboard-focusable controls for all major actions.
- Skip link to jump directly to main content (`#main-content`).
- Landmark structure:
  - primary navigation with `aria-label`
  - dedicated `main` region
- Explicit form labels on critical controls (login, users filters, audit filters).
- Accessible table semantics on users table (`caption` + headers).
- Expand/collapse semantics in audit feed (`aria-expanded` + `aria-controls`).
- Live status announcements for dynamic states (`aria-live` on key status regions).

## CI A11y Smoke Checks

- Playwright smoke suite: `tests/e2e/a11y-smoke.spec.ts`
- CI runs this suite via `pnpm e2e:a11y`

Coverage includes:

- login page label and keyboard-tab flow
- dashboard shell landmarks (`navigation`, `main`)
- users table caption/structure
- audit details toggle semantics
- roles revision controls accessibility baseline

## Keyboard Map (Critical Paths)

- `Tab` from page top reaches skip link first.
- `Enter` on skip link moves focus to the `main` content region.
- All filter controls and action buttons are reachable via sequential tab navigation.
- Expand/collapse controls in audit feed are keyboard operable.

## Focus Strategy

- Preserve browser-default focus behavior for native controls.
- Provide visible focus styles through global ring theme.
- Keep action elements as semantic `button` or `a` controls.

## Known Limitations

- No full WCAG audit yet (manual + automated mixed audit still pending).
- No screen-reader snapshot testing yet.
- Toast announcement semantics rely on third-party component defaults.
