'use client';

import { useAuth } from '@/features/auth/ui/auth-provider';
import { emitRandomRealtimeEvent } from '@/mocks/ws/event-bus';
import { ROLES, type Role } from '@/shared/types/auth';
import { OfflineBanner } from '@/widgets/offline-banner/ui/offline-banner';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/users', label: 'Users' },
  { href: '/roles', label: 'Roles' },
  { href: '/audit', label: 'Audit' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, logout, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-zinc-200 bg-white px-4 py-6">
          <h1 className="text-lg font-semibold">AccessOps</h1>
          <p className="mt-1 text-xs text-zinc-500">RBAC Management Demo</p>

          <nav className="mt-8 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium">{session?.name ?? 'Unknown user'}</p>
              <p className="text-xs text-zinc-500">{session?.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="role-switch" className="text-xs text-zinc-500">
                Dev role switch
              </label>
              <select
                id="role-switch"
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                value={role ?? ''}
                onChange={(event) => switchRole(event.target.value as Role)}
              >
                {ROLES.map((availableRole) => (
                  <option key={availableRole} value={availableRole}>
                    {availableRole}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
                onClick={() => emitRandomRealtimeEvent()}
              >
                Simulate event
              </button>

              <button
                type="button"
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
              >
                Logout
              </button>
            </div>
          </header>
          <OfflineBanner />

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
