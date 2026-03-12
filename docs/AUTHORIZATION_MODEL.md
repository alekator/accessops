# Authorization Model

## Scope

The current project uses a frontend-first authorization model with mocked APIs.
Authorization is represented as role-bound permission policies and enforced at UI and route levels.

## Source Of Truth

- Role names and user role assignment: session state (`Admin`, `Manager`, `Viewer`)
- Permission schema: [`PermissionPolicySchema`](../src/entities/role/model/schemas.ts)
- Route access rules: [`resolveRouteAccess`](../src/features/auth/model/rbac.ts)
- Role policies: mock role fixtures (in-memory)

In this mode, the source of truth is the frontend mock domain. In a real backend mode, this must move to server persistence and server-side checks.

## Domain Entities

- `Role`: `Admin | Manager | Viewer`
- `PermissionModule`: `Users | Billing | Documents | Reports`
- `PermissionAction`: `Read | Write | Delete | Export | Admin`
- `PermissionPolicy`: matrix `<module, action> -> boolean`

Each role has exactly one policy matrix.

## Effective Permission Rules

- Effective permission is a direct lookup: `policy[module][action]`.
- There is no inheritance chain between roles.
- There are no per-user overrides in the current implementation.
- There is no deny precedence logic because each cell has a single boolean value.

## Enforcement Boundary

Current implementation has two levels:

- UI-level restrictions:
  - disable/lock controls for non-admin role states
  - hide or redirect disallowed flows
- Route-level restrictions:
  - middleware + RBAC route resolver redirect disallowed users

Important: this is not a security boundary for production. Backend enforcement must validate every protected action server-side.

## Route Access Rules

- Unauthenticated access to protected routes redirects to `/login`.
- `Viewer` is denied access to `/roles*` and redirected to `/users`.
- `Manager` may access `/roles*` in read-only mode.
- `Admin` may access protected routes and edit policies.

Protected route prefixes:

- `/users`
- `/roles`
- `/audit`

## Policy Validation

Policy payloads are validated with Zod schema parsing:

- complete module/action matrix is required
- each permission value must be a boolean
- invalid JSON payload or invalid shape is rejected on import

Invalid policy examples:

- missing module node (`Reports` absent)
- missing action flag in module (`Users.Write` absent)
- unknown module/action keys
- non-boolean permission values

## Policy Import / Export Format

Export format is raw JSON policy matrix:

```json
{
  "Users": { "Read": true, "Write": false, "Delete": false, "Export": true, "Admin": false },
  "Billing": { "Read": true, "Write": false, "Delete": false, "Export": false, "Admin": false },
  "Documents": { "Read": true, "Write": true, "Delete": false, "Export": false, "Admin": false },
  "Reports": { "Read": true, "Write": false, "Delete": false, "Export": true, "Admin": false }
}
```

On import, payload is parsed and validated before being applied to draft state.

## Current Limitations

- No server-side authorization checks in mock mode
- No policy revision/approval lifecycle yet
- No policy conflict resolution model because inheritance/overrides are not implemented
