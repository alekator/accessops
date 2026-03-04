# Release Process

## Commit convention

Use Conventional Commits:

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `test: ...`
- `docs: ...`

## Version tags

- `v0.1.0` baseline architecture
- `v0.2.0` feature-complete dashboard
- `v0.3.0` production-readiness polish

## Changelog

- Keep `CHANGELOG.md` updated per milestone.
- Group changes by Added/Changed/Fixed.

## Pre-release checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```
