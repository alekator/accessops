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
  { href: '/roles?view=states', label: 'UI States' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, logout, switchRole } = useAuth();

  return (
    <div className="min-h-screen text-zinc-900">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-1 gap-4 p-3 lg:grid-cols-[260px_1fr] lg:p-4">
        <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#1f2340,#232b5e)] px-4 py-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.28)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur">
            <p className="text-[11px] font-medium tracking-[0.24em] text-sky-200 uppercase">
              Control Layer
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight">AccessOps</h1>
            <p className="mt-1 text-xs text-slate-300">RBAC Management Demo</p>
          </div>

          <nav aria-label="Primary" className="mt-8 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === '/roles?view=states'
                  ? pathname.startsWith('/roles')
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'block rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            <p className="font-medium text-white">Portfolio scenario</p>
            <p className="mt-1 leading-5">
              Enterprise admin workflows, mocked APIs, and production-style frontend architecture.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col rounded-[28px] border border-white/70 bg-white/75 shadow-[0_18px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.22em] text-zinc-500 uppercase">
                Active Operator
              </p>
              <p className="mt-1 text-sm font-semibold">{session?.name ?? 'Unknown user'}</p>
              <p className="text-xs text-zinc-500">{session?.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="role-switch" className="text-xs font-medium text-zinc-500">
                Dev role switch
              </label>
              <select
                id="role-switch"
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm"
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
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-zinc-50"
                onClick={() => emitRandomRealtimeEvent()}
              >
                Simulate event
              </button>

              <button
                type="button"
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-zinc-50"
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

          <main id="main-content" tabIndex={-1} className="flex-1 p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
