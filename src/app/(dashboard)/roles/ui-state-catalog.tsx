'use client';

import { useState } from 'react';

export function UiStateCatalog() {
  const [showAuditDetails, setShowAuditDetails] = useState(false);
  const [readOnly, setReadOnly] = useState(true);

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(216,180,254,0.35),rgba(255,255,255,0.96),rgba(165,243,252,0.35))] p-5 shadow-[0_14px_50px_rgba(148,163,184,0.18)]">
        <p className="text-[11px] font-medium tracking-[0.22em] text-fuchsia-700 uppercase">
          UI State Catalog
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Visual State Coverage</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Storybook-equivalent screen with explicit states for admin workflows: empty, loading,
          error, read-only, offline, and revision actions.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
          <h3 className="text-sm font-semibold">Users table: empty state</h3>
          <div className="mt-3 rounded-md border border-zinc-200 p-4 text-sm text-zinc-500">
            No users matched your filters.
          </div>
        </article>

        <article className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
          <h3 className="text-sm font-semibold">Users table: loading and error state</h3>
          <div className="mt-3 space-y-2">
            <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-500">
              Loading users...
            </div>
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Failed to load users. Please try again.
            </div>
          </div>
        </article>

        <article className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
          <h3 className="text-sm font-semibold">Roles: read-only and proposed revision state</h3>
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Read-only access: Manager can inspect policies and revision history.
          </div>
          <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-500">Open proposed revision</p>
            <p className="mt-1 text-sm">Revision v7 by admin@accessops.dev</p>
            <p className="text-xs text-zinc-500">Note: Tighten billing write permissions</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-md bg-emerald-700 px-2 py-1 text-xs font-medium text-white disabled:bg-emerald-300"
                disabled={readOnly}
              >
                Approve revision
              </button>
              <button
                type="button"
                className="rounded-md bg-rose-700 px-2 py-1 text-xs font-medium text-white disabled:bg-rose-300"
                disabled={readOnly}
              >
                Reject revision
              </button>
            </div>
          </div>
          <div className="mt-3">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={readOnly}
                onChange={(event) => setReadOnly(event.target.checked)}
              />
              Read-only lock
            </label>
          </div>
        </article>

        <article className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
          <h3 className="text-sm font-semibold">Audit item: collapsed/expanded details</h3>
          <div className="mt-3 rounded-[16px] border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">ROLE_UPDATED</p>
                <p className="text-xs text-zinc-500">2026-03-01 14:21 | usr_007</p>
              </div>
              <button
                type="button"
                aria-expanded={showAuditDetails}
                onClick={() => setShowAuditDetails((prev) => !prev)}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
              >
                {showAuditDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-700">Policy revision v7 approved</p>
            {showAuditDetails ? (
              <pre className="mt-2 overflow-auto rounded-md bg-zinc-100 p-2 text-xs">{`{
  "roleId": "role_manager",
  "revisionId": "rev_0042",
  "status": "approved"
}`}</pre>
            ) : null}
          </div>
        </article>
      </div>

      <article className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_10px_35px_rgba(148,163,184,0.12)]">
        <h3 className="text-sm font-semibold">Connectivity and destructive confirmation states</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
            You are offline. Changes requiring network will retry after reconnect.
          </div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-sm text-zinc-700">Suspend 3 selected users?</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-700 px-2 py-1 text-xs font-medium text-white"
              >
                Confirm suspend
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
