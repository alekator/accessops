'use client';

import { approveRoleRevision } from '@/entities/role/api/approve-role-revision';
import { getRoleRevisions } from '@/entities/role/api/get-role-revisions';
import { getRoles } from '@/entities/role/api/get-roles';
import { proposeRoleRevision } from '@/entities/role/api/propose-role-revision';
import { rejectRoleRevision } from '@/entities/role/api/reject-role-revision';
import { rollbackRolePolicy } from '@/entities/role/api/rollback-role-policy';
import { PermissionPolicySchema, type PermissionPolicy } from '@/entities/role/model/schemas';
import { useAuth } from '@/features/auth/ui/auth-provider';
import { logInfo } from '@/features/observability/model/client-logger';
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  getPolicyDiff,
  toggleAll,
  toggleCell,
  toggleColumn,
  toggleRow,
} from '@/features/roles/permission-matrix/model/matrix-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { UiStateCatalog } from './ui-state-catalog';

export default function RolesPage() {
  const { role, session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canEdit = role === 'Admin';
  const isReadOnlyViewer = role === 'Manager';
  const isUiStatesView =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'states';

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draftByRole, setDraftByRole] = useState<Record<string, PermissionPolicy>>({});
  const [importValue, setImportValue] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (role === 'Viewer') {
      router.replace('/users');
    }
  }, [role, router]);

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });

  const activeRoleId = selectedRoleId ?? rolesQuery.data?.items[0]?.id ?? null;
  const activeRole = rolesQuery.data?.items.find((item) => item.id === activeRoleId) ?? null;

  const revisionsQuery = useQuery({
    queryKey: ['role-revisions', activeRoleId],
    queryFn: () => getRoleRevisions(activeRoleId!),
    enabled: Boolean(activeRoleId),
  });

  const activePolicy = revisionsQuery.data?.role.policy ?? activeRole?.policy ?? null;
  const draftPolicy =
    activeRoleId && activePolicy ? (draftByRole[activeRoleId] ?? activePolicy) : null;
  const diff = activePolicy && draftPolicy ? getPolicyDiff(activePolicy, draftPolicy) : [];
  const proposedRevision =
    revisionsQuery.data?.items.find((item) => item.status === 'proposed') ?? null;
  const activeRevisionId = revisionsQuery.data?.activeRevisionId ?? null;

  function syncAfterRevisionAction(roleId: string) {
    void queryClient.invalidateQueries({ queryKey: ['roles'] });
    void queryClient.invalidateQueries({ queryKey: ['role-revisions', roleId] });
  }

  const proposeMutation = useMutation({
    mutationFn: (payload: { roleId: string; policy: PermissionPolicy; note?: string }) =>
      proposeRoleRevision(payload.roleId, {
        policy: payload.policy,
        actorId: session?.email ?? 'admin@accessops.dev',
        note: payload.note,
      }),
    onSuccess: (result) => {
      syncAfterRevisionAction(result.role.id);
      setRevisionNote('');
      logInfo('role_policy_revision_proposed', {
        roleId: result.role.id,
        revisionId: result.revision.id,
        version: result.revision.version,
      });
      toast.success(`Revision v${result.revision.version} proposed`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to propose revision');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (payload: { roleId: string; revisionId: string }) =>
      approveRoleRevision(payload.roleId, payload.revisionId, {
        actorId: session?.email ?? 'admin@accessops.dev',
      }),
    onSuccess: (result) => {
      syncAfterRevisionAction(result.role.id);
      setDraftByRole((prev) => {
        const next = { ...prev };
        delete next[result.role.id];
        return next;
      });
      logInfo('role_policy_revision_approved', {
        roleId: result.role.id,
        revisionId: result.revision.id,
        version: result.revision.version,
      });
      toast.success(`Revision v${result.revision.version} approved and activated`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to approve revision');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (payload: { roleId: string; revisionId: string; reason?: string }) =>
      rejectRoleRevision(payload.roleId, payload.revisionId, {
        actorId: session?.email ?? 'admin@accessops.dev',
        reason: payload.reason,
      }),
    onSuccess: (result) => {
      syncAfterRevisionAction(result.role.id);
      setRejectionReason('');
      logInfo('role_policy_revision_rejected', {
        roleId: result.role.id,
        revisionId: result.revision.id,
        version: result.revision.version,
      });
      toast.success(`Revision v${result.revision.version} rejected`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reject revision');
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: (payload: { roleId: string; revisionId: string }) =>
      rollbackRolePolicy(payload.roleId, payload.revisionId, {
        actorId: session?.email ?? 'admin@accessops.dev',
      }),
    onSuccess: (result) => {
      syncAfterRevisionAction(result.role.id);
      setDraftByRole((prev) => {
        const next = { ...prev };
        delete next[result.role.id];
        return next;
      });
      logInfo('role_policy_rolled_back', {
        roleId: result.role.id,
        revisionId: result.revision.id,
        rollbackTargetRevisionId: result.revision.rollbackTargetRevisionId,
      });
      toast.success(`Policy rolled back via revision v${result.revision.version}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to rollback revision');
    },
  });

  const effectiveSummary = !draftPolicy
    ? {
        totalEnabled: 0,
        totalPossible: PERMISSION_MODULES.length * PERMISSION_ACTIONS.length,
        byModule: [] as Array<{ module: string; enabled: number; total: number }>,
      }
    : (() => {
        const byModule = PERMISSION_MODULES.map((moduleName) => {
          const enabled = PERMISSION_ACTIONS.filter(
            (action) => draftPolicy[moduleName][action],
          ).length;
          return {
            module: moduleName,
            enabled,
            total: PERMISSION_ACTIONS.length,
          };
        });

        return {
          totalEnabled: byModule.reduce((acc, item) => acc + item.enabled, 0),
          totalPossible: PERMISSION_MODULES.length * PERMISSION_ACTIONS.length,
          byModule,
        };
      })();

  function setDraft(nextPolicy: PermissionPolicy) {
    if (!activeRoleId) {
      return;
    }
    setDraftByRole((prev) => ({
      ...prev,
      [activeRoleId]: nextPolicy,
    }));
  }

  function handleImportPolicy() {
    if (!draftPolicy) {
      return;
    }

    try {
      const payload = JSON.parse(importValue) as unknown;
      const parsed = PermissionPolicySchema.safeParse(payload);
      if (!parsed.success) {
        toast.error('Invalid policy JSON structure');
        return;
      }
      setDraft(parsed.data);
      logInfo('role_policy_imported', { roleId: activeRoleId });
      toast.success('Policy imported into draft');
    } catch {
      toast.error('Invalid JSON');
    }
  }

  function handleExportPolicy() {
    if (!draftPolicy || !activeRole) {
      return;
    }
    const blob = new Blob([JSON.stringify(draftPolicy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeRole.name.toLowerCase()}-policy.json`;
    link.click();
    URL.revokeObjectURL(url);
    logInfo('role_policy_exported', { roleId: activeRole.id, roleName: activeRole.name });
  }

  if (rolesQuery.isLoading) {
    return <div className="text-sm text-zinc-500">Loading roles...</div>;
  }

  if (role === 'Viewer') {
    return <div className="text-sm text-zinc-500">Redirecting...</div>;
  }

  if (rolesQuery.isError || !rolesQuery.data) {
    return <div className="text-sm text-red-600">Unable to load roles.</div>;
  }

  if (revisionsQuery.isError) {
    return <div className="text-sm text-red-600">Unable to load role revisions.</div>;
  }

  if (isUiStatesView) {
    return <UiStateCatalog />;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(224,231,255,0.9),rgba(255,255,255,0.96),rgba(209,250,229,0.75))] p-5 shadow-[0_14px_50px_rgba(148,163,184,0.18)]">
        <p className="text-[11px] font-medium tracking-[0.22em] text-indigo-700 uppercase">
          Policy Matrix
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Roles & Permissions</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Role policy changes now follow revision workflow: propose, approve/reject, rollback.
        </p>
      </div>

      <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm text-zinc-700">
          Current role: <strong>{role}</strong>
        </p>
        {isReadOnlyViewer ? (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Read-only access: Manager can inspect policies and revision history, but propose,
            approve, reject, and rollback actions are locked.
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4 rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="role-select" className="text-sm text-zinc-600">
              Selected role:
            </label>
            <select
              id="role-select"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={activeRoleId ?? ''}
              onChange={(event) => setSelectedRoleId(event.target.value)}
            >
              {rolesQuery.data.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!draftPolicy || !canEdit || Boolean(proposedRevision)}
              onClick={() => {
                if (!draftPolicy) {
                  return;
                }
                setDraft(toggleAll(draftPolicy));
              }}
            >
              Toggle all
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!draftPolicy || !canEdit}
              onClick={handleExportPolicy}
            >
              Export JSON
            </button>
          </div>

          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-100 text-left text-xs tracking-wide text-zinc-600 uppercase">
                  <th className="px-3 py-2">Module</th>
                  {PERMISSION_ACTIONS.map((action) => (
                    <th key={action} className="px-3 py-2">
                      <button
                        type="button"
                        disabled={!draftPolicy || !canEdit || Boolean(proposedRevision)}
                        className="text-xs hover:underline disabled:no-underline disabled:opacity-50"
                        onClick={() => {
                          if (!draftPolicy) {
                            return;
                          }
                          setDraft(toggleColumn(draftPolicy, action));
                        }}
                      >
                        {action}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MODULES.map((moduleName) => (
                  <tr key={moduleName} className="border-t border-zinc-200">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        disabled={!draftPolicy || !canEdit || Boolean(proposedRevision)}
                        className="font-medium hover:underline disabled:no-underline disabled:opacity-50"
                        onClick={() => {
                          if (!draftPolicy) {
                            return;
                          }
                          setDraft(toggleRow(draftPolicy, moduleName));
                        }}
                      >
                        {moduleName}
                      </button>
                    </td>
                    {PERMISSION_ACTIONS.map((action) => (
                      <td key={`${moduleName}-${action}`} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={draftPolicy?.[moduleName][action] ?? false}
                          disabled={!draftPolicy || !canEdit || Boolean(proposedRevision)}
                          onChange={() => {
                            if (!draftPolicy) {
                              return;
                            }
                            setDraft(toggleCell(draftPolicy, moduleName, action));
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-600">Revision note (optional)</p>
            <input
              type="text"
              value={revisionNote}
              onChange={(event) => setRevisionNote(event.target.value)}
              placeholder="Why this policy change is proposed"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              disabled={!canEdit || Boolean(proposedRevision)}
            />
            <button
              type="button"
              disabled={
                !canEdit ||
                !draftPolicy ||
                !activeRoleId ||
                diff.length === 0 ||
                Boolean(proposedRevision) ||
                proposeMutation.isPending
              }
              onClick={() => {
                if (!draftPolicy || !activeRoleId) {
                  return;
                }
                proposeMutation.mutate({
                  roleId: activeRoleId,
                  policy: draftPolicy,
                  note: revisionNote,
                });
              }}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {proposeMutation.isPending ? 'Proposing...' : 'Propose revision'}
            </button>
            {!canEdit ? <span className="text-xs text-amber-700">Read-only mode</span> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
            <h3 className="text-sm font-semibold">Current state</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Active revision ID: {activeRevisionId ?? 'n/a'}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Enabled: {effectiveSummary.totalEnabled}/{effectiveSummary.totalPossible}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-700">
              {effectiveSummary.byModule.map((item) => (
                <li key={item.module}>
                  {item.module}: {item.enabled}/{item.total}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
            <h3 className="text-sm font-semibold">Draft diff</h3>
            {diff.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No unsaved permission changes.</p>
            ) : (
              <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-sm">
                {diff.map((item) => (
                  <li key={`${item.module}:${item.action}`}>
                    {item.module}.{item.action}: {String(item.from)} -&gt; {String(item.to)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
            <h3 className="text-sm font-semibold">Open proposed revision</h3>
            {!proposedRevision ? (
              <p className="mt-2 text-sm text-zinc-500">No proposed revision for this role.</p>
            ) : (
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  Revision v{proposedRevision.version} by {proposedRevision.createdBy}
                </p>
                <p className="text-xs text-zinc-500">{proposedRevision.createdAt}</p>
                <p className="text-xs text-zinc-600">
                  Note: {proposedRevision.note ?? 'No note provided'}
                </p>
                <textarea
                  aria-label="Rejection reason"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="min-h-[70px] w-full rounded-md border border-zinc-300 px-3 py-2 text-xs"
                  disabled={!canEdit}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!canEdit || approveMutation.isPending}
                    onClick={() => {
                      if (!activeRoleId || !proposedRevision) {
                        return;
                      }
                      approveMutation.mutate({
                        roleId: activeRoleId,
                        revisionId: proposedRevision.id,
                      });
                    }}
                    className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {approveMutation.isPending ? 'Approving...' : 'Approve revision'}
                  </button>
                  <button
                    type="button"
                    disabled={!canEdit || rejectMutation.isPending}
                    onClick={() => {
                      if (!activeRoleId || !proposedRevision) {
                        return;
                      }
                      rejectMutation.mutate({
                        roleId: activeRoleId,
                        revisionId: proposedRevision.id,
                        reason: rejectionReason,
                      });
                    }}
                    className="rounded-md bg-rose-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject revision'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
            <h3 className="text-sm font-semibold">Import JSON policy</h3>
            <textarea
              aria-label="Import JSON policy"
              value={importValue}
              onChange={(event) => setImportValue(event.target.value)}
              placeholder='Paste policy JSON here, e.g. {"Users":{"Read":true,...}}'
              className="mt-2 min-h-[120px] w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs"
              disabled={!canEdit || Boolean(proposedRevision)}
            />
            <button
              type="button"
              disabled={!canEdit || !draftPolicy || Boolean(proposedRevision)}
              onClick={handleImportPolicy}
              className="mt-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply import to draft
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
        <h3 className="text-sm font-semibold">Revision history</h3>
        {revisionsQuery.isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">Loading revisions...</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {(revisionsQuery.data?.items ?? []).map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">v{item.version}</span>
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs uppercase">
                    {item.status}
                  </span>
                  {item.id === activeRevisionId ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                      active
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  by {item.createdBy} at {item.createdAt}
                </p>
                {item.note ? <p className="mt-1 text-xs text-zinc-700">Note: {item.note}</p> : null}
                {item.rejectionReason ? (
                  <p className="mt-1 text-xs text-rose-700">Rejected: {item.rejectionReason}</p>
                ) : null}
                {canEdit &&
                item.id !== activeRevisionId &&
                item.status !== 'proposed' &&
                item.status !== 'rejected' ? (
                  <button
                    type="button"
                    className="mt-2 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={rollbackMutation.isPending}
                    onClick={() => {
                      if (!activeRoleId) {
                        return;
                      }
                      rollbackMutation.mutate({
                        roleId: activeRoleId,
                        revisionId: item.id,
                      });
                    }}
                  >
                    Rollback to this revision
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
