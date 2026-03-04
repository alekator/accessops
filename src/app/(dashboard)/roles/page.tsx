'use client';

import { useAuth } from '@/features/auth/ui/auth-provider';

export default function RolesPage() {
  const { role } = useAuth();
  const canSave = role === 'Admin';

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Roles & Permissions</h2>
      <p className="text-sm text-zinc-600">
        Managers can view this page. Saving policy updates is restricted to Admin.
      </p>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-700">
          Current role: <strong>{role}</strong>
        </p>
        <button
          type="button"
          disabled={!canSave}
          className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          Save policy
        </button>
      </div>
    </section>
  );
}
