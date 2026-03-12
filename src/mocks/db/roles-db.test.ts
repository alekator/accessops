import { describe, expect, it } from 'vitest';

import {
  approveRoleRevisionById,
  getRoleById,
  listRoleRevisions,
  proposeRoleRevisionById,
  rejectRoleRevisionById,
  rollbackRolePolicyByRevisionId,
} from './roles-db';

function clonePolicy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('roles revision workflow db', () => {
  it('proposes and approves revision, updating active policy', () => {
    const roleId = 'role_admin';
    const role = getRoleById(roleId)!;
    const nextPolicy = clonePolicy(role.policy);
    nextPolicy.Users.Read = !nextPolicy.Users.Read;

    const proposed = proposeRoleRevisionById({
      roleId,
      policy: nextPolicy,
      actorId: 'admin@accessops.dev',
      note: 'Adjust read access',
    });
    expect(proposed).not.toBeNull();
    expect(proposed && 'error' in proposed).toBe(false);

    const revisionId = (proposed as { revision: { id: string } }).revision.id;
    const approved = approveRoleRevisionById({
      roleId,
      revisionId,
      actorId: 'admin@accessops.dev',
    });
    expect(approved).not.toBeNull();
    expect(approved && 'error' in approved).toBe(false);
    expect(getRoleById(roleId)?.policy.Users.Read).toBe(nextPolicy.Users.Read);
  });

  it('rejects proposed revision without changing active policy', () => {
    const roleId = 'role_manager';
    const role = getRoleById(roleId)!;
    const before = clonePolicy(role.policy);
    const nextPolicy = clonePolicy(role.policy);
    nextPolicy.Billing.Write = !nextPolicy.Billing.Write;

    const proposed = proposeRoleRevisionById({
      roleId,
      policy: nextPolicy,
      actorId: 'admin@accessops.dev',
    });
    expect(proposed).not.toBeNull();
    expect(proposed && 'error' in proposed).toBe(false);

    const revisionId = (proposed as { revision: { id: string } }).revision.id;
    const rejected = rejectRoleRevisionById({
      roleId,
      revisionId,
      actorId: 'admin@accessops.dev',
      reason: 'Risky permission change',
    });
    expect(rejected).not.toBeNull();
    expect(rejected && 'error' in rejected).toBe(false);
    expect(getRoleById(roleId)?.policy).toEqual(before);
  });

  it('creates rollback revision and restores target policy snapshot', () => {
    const roleId = 'role_viewer';
    const baselineRevisions = listRoleRevisions(roleId)!;
    const rollbackTargetId = baselineRevisions.items[0].id;

    const role = getRoleById(roleId)!;
    const nextPolicy = clonePolicy(role.policy);
    nextPolicy.Documents.Export = true;

    const proposed = proposeRoleRevisionById({
      roleId,
      policy: nextPolicy,
      actorId: 'admin@accessops.dev',
    });
    const revisionId = (proposed as { revision: { id: string } }).revision.id;
    approveRoleRevisionById({
      roleId,
      revisionId,
      actorId: 'admin@accessops.dev',
    });
    expect(getRoleById(roleId)?.policy.Documents.Export).toBe(true);

    const rollback = rollbackRolePolicyByRevisionId({
      roleId,
      targetRevisionId: rollbackTargetId,
      actorId: 'admin@accessops.dev',
    });
    expect(rollback).not.toBeNull();
    expect(rollback && 'error' in rollback).toBe(false);
    expect(getRoleById(roleId)?.policy.Documents.Export).toBe(false);
  });
});
