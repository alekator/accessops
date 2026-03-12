import { type PermissionPolicy } from '@/entities/role/model/schemas';
import { type RolePolicyRevision } from '@/entities/role/model/revisions';
import { createRolesFixture } from '@/mocks/fixtures/roles';

const rolesDb = createRolesFixture();
let revisionCounter = 0;

type RevisionsState = {
  activeRevisionId: string | null;
  items: RolePolicyRevision[];
};

const revisionsByRole = new Map<string, RevisionsState>();

function clonePolicy(policy: PermissionPolicy): PermissionPolicy {
  return JSON.parse(JSON.stringify(policy)) as PermissionPolicy;
}

function nowIso() {
  return new Date().toISOString();
}

function initRevisions() {
  rolesDb.forEach((role) => {
    revisionCounter += 1;
    const baselineId = `rev_${revisionCounter.toString().padStart(4, '0')}`;
    const baseline: RolePolicyRevision = {
      id: baselineId,
      roleId: role.id,
      version: 1,
      status: 'approved',
      policy: clonePolicy(role.policy),
      createdAt: nowIso(),
      createdBy: 'system',
      note: 'Initial baseline policy',
      approvedAt: nowIso(),
      approvedBy: 'system',
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      rollbackTargetRevisionId: null,
    };

    revisionsByRole.set(role.id, {
      activeRevisionId: baselineId,
      items: [baseline],
    });
  });
}

initRevisions();

export function listRoles() {
  return rolesDb;
}

export function getRoleById(roleId: string) {
  return rolesDb.find((role) => role.id === roleId) ?? null;
}

export function updateRolePolicyById(roleId: string, policy: PermissionPolicy) {
  const index = rolesDb.findIndex((role) => role.id === roleId);
  if (index < 0) {
    return null;
  }
  rolesDb[index] = {
    ...rolesDb[index],
    policy,
  };
  return rolesDb[index];
}

export function listRoleRevisions(roleId: string) {
  return revisionsByRole.get(roleId) ?? null;
}

export function proposeRoleRevisionById(input: {
  roleId: string;
  policy: PermissionPolicy;
  actorId: string;
  note?: string;
}) {
  const role = getRoleById(input.roleId);
  const state = revisionsByRole.get(input.roleId);
  if (!role || !state) {
    return null;
  }

  const hasOpenProposed = state.items.some((item) => item.status === 'proposed');
  if (hasOpenProposed) {
    return { error: 'REVISION_CONFLICT' as const };
  }

  const lastVersion = state.items.reduce((max, item) => Math.max(max, item.version), 0);
  revisionCounter += 1;
  const revision: RolePolicyRevision = {
    id: `rev_${revisionCounter.toString().padStart(4, '0')}`,
    roleId: input.roleId,
    version: lastVersion + 1,
    status: 'proposed',
    policy: clonePolicy(input.policy),
    createdAt: nowIso(),
    createdBy: input.actorId,
    note: input.note?.trim() ? input.note.trim() : null,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    rollbackTargetRevisionId: null,
  };

  state.items.unshift(revision);
  return { role, revision, activeRevisionId: state.activeRevisionId };
}

export function approveRoleRevisionById(input: {
  roleId: string;
  revisionId: string;
  actorId: string;
}) {
  const role = getRoleById(input.roleId);
  const state = revisionsByRole.get(input.roleId);
  if (!role || !state) {
    return null;
  }

  const revision = state.items.find((item) => item.id === input.revisionId);
  if (!revision) {
    return { error: 'REVISION_NOT_FOUND' as const };
  }
  if (revision.status !== 'proposed') {
    return { error: 'INVALID_REVISION_STATUS' as const };
  }

  revision.status = 'approved';
  revision.approvedAt = nowIso();
  revision.approvedBy = input.actorId;
  revision.rejectedAt = null;
  revision.rejectedBy = null;
  revision.rejectionReason = null;

  updateRolePolicyById(input.roleId, clonePolicy(revision.policy));
  state.activeRevisionId = revision.id;

  return { role: getRoleById(input.roleId)!, revision, activeRevisionId: state.activeRevisionId };
}

export function rejectRoleRevisionById(input: {
  roleId: string;
  revisionId: string;
  actorId: string;
  reason?: string;
}) {
  const role = getRoleById(input.roleId);
  const state = revisionsByRole.get(input.roleId);
  if (!role || !state) {
    return null;
  }

  const revision = state.items.find((item) => item.id === input.revisionId);
  if (!revision) {
    return { error: 'REVISION_NOT_FOUND' as const };
  }
  if (revision.status !== 'proposed') {
    return { error: 'INVALID_REVISION_STATUS' as const };
  }

  revision.status = 'rejected';
  revision.rejectedAt = nowIso();
  revision.rejectedBy = input.actorId;
  revision.rejectionReason = input.reason?.trim() ? input.reason.trim() : null;

  return { role, revision, activeRevisionId: state.activeRevisionId };
}

export function rollbackRolePolicyByRevisionId(input: {
  roleId: string;
  targetRevisionId: string;
  actorId: string;
}) {
  const role = getRoleById(input.roleId);
  const state = revisionsByRole.get(input.roleId);
  if (!role || !state) {
    return null;
  }

  const target = state.items.find((item) => item.id === input.targetRevisionId);
  if (!target) {
    return { error: 'REVISION_NOT_FOUND' as const };
  }
  if (target.status === 'rejected') {
    return { error: 'INVALID_ROLLBACK_TARGET' as const };
  }

  const lastVersion = state.items.reduce((max, item) => Math.max(max, item.version), 0);
  revisionCounter += 1;
  const rollbackRevision: RolePolicyRevision = {
    id: `rev_${revisionCounter.toString().padStart(4, '0')}`,
    roleId: input.roleId,
    version: lastVersion + 1,
    status: 'rolled_back',
    policy: clonePolicy(target.policy),
    createdAt: nowIso(),
    createdBy: input.actorId,
    note: `Rollback to revision ${target.version}`,
    approvedAt: nowIso(),
    approvedBy: input.actorId,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    rollbackTargetRevisionId: target.id,
  };

  state.items.unshift(rollbackRevision);
  state.activeRevisionId = rollbackRevision.id;
  updateRolePolicyById(input.roleId, clonePolicy(target.policy));

  return {
    role: getRoleById(input.roleId)!,
    revision: rollbackRevision,
    activeRevisionId: state.activeRevisionId,
  };
}
