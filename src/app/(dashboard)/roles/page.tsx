'use client';

import { getRoles } from '@/entities/role/api/get-roles';
import { updateRolePolicy } from '@/entities/role/api/update-role-policy';
import { PermissionPolicySchema, type PermissionPolicy } from '@/entities/role/model/schemas';
import { logInfo } from '@/features/observability/model/client-logger';
import { useAuth } from '@/features/auth/ui/auth-provider';
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

export default function RolesPage() {
  const { role } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canEdit = role === 'Admin';
  const isReadOnlyViewer = role === 'Manager';

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draftByRole, setDraftByRole] = useState<Record<string, PermissionPolicy>>({});
  const [importValue, setImportValue] = useState('');

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
  const basePolicy = activeRole?.policy ?? null;
  const draftPolicy = activeRoleId && basePolicy ? (draftByRole[activeRoleId] ?? basePolicy) : null;
  const diff = basePolicy && draftPolicy ? getPolicyDiff(basePolicy, draftPolicy) : [];

  const saveMutation = useMutation({
    mutationFn: (payload: { roleId: string; policy: PermissionPolicy }) =>
      updateRolePolicy(payload.roleId, payload.policy),
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(
        ['roles'],
        (prev: Awaited<ReturnType<typeof getRoles>> | undefined) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            items: prev.items.map((item) => (item.id === updatedRole.id ? updatedRole : item)),
          };
        },
      );

      setDraftByRole((prev) => {
        const next = { ...prev };
        delete next[updatedRole.id];
        return next;
      });
      logInfo('role_policy_saved', { roleId: updatedRole.id, roleName: updatedRole.name });
      toast.success('Role policy saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save role policy');
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

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(224,231,255,0.9),rgba(255,255,255,0.96),rgba(209,250,229,0.75))] p-5 shadow-[0_14px_50px_rgba(148,163,184,0.18)]">
        <p className="text-[11px] font-medium tracking-[0.22em] text-indigo-700 uppercase">
          Policy Matrix
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Roles & Permissions</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Managers can view this page in read-only mode. Saving policy updates is restricted to
          Admin.
        </p>
      </div>

      <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm text-zinc-700">
          Current role: <strong>{role}</strong>
        </p>
        {isReadOnlyViewer ? (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Read-only access: Manager can inspect policies, but editing, importing, and saving are
            locked.
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
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
              disabled={!draftPolicy || !canEdit}
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
                        disabled={!draftPolicy || !canEdit}
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
                        disabled={!draftPolicy || !canEdit}
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
                          disabled={!draftPolicy || !canEdit}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                !canEdit ||
                !draftPolicy ||
                !activeRoleId ||
                diff.length === 0 ||
                saveMutation.isPending
              }
              onClick={() => {
                if (!draftPolicy || !activeRoleId) {
                  return;
                }
                saveMutation.mutate({
                  roleId: activeRoleId,
                  policy: draftPolicy,
                });
              }}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save policy'}
            </button>
            {!canEdit ? <span className="text-xs text-amber-700">Read-only mode</span> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
            <h3 className="text-sm font-semibold">Effective permissions</h3>
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
            <h3 className="text-sm font-semibold">Diff since last saved</h3>
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
            <h3 className="text-sm font-semibold">Import JSON policy</h3>
            <textarea
              aria-label="Import JSON policy"
              value={importValue}
              onChange={(event) => setImportValue(event.target.value)}
              placeholder='Paste policy JSON here, e.g. {"Users":{"Read":true,...}}'
              className="mt-2 min-h-[140px] w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs"
              disabled={!canEdit}
            />
            <button
              type="button"
              disabled={!canEdit || !draftPolicy}
              onClick={handleImportPolicy}
              className="mt-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply import to draft
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
