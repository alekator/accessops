'use client';

import { getAuditEvents } from '@/entities/audit/api/get-audit-events';
import { downloadAuditCsv } from '@/features/audit/export-csv/model/export-audit-csv';
import {
  DEFAULT_AUDIT_FILTERS,
  parseAuditFilters,
  toAuditQueryString,
} from '@/features/audit/filters/model/query-params';
import { useInfiniteQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export function AuditPageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseAuditFilters(searchParams), [searchParams]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const auditQuery = useInfiniteQuery({
    queryKey: ['audit', filters],
    queryFn: ({ pageParam }) => getAuditEvents(pageParam, filters),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (!loadMoreRef.current) {
      return;
    }

    const target = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && auditQuery.hasNextPage && !auditQuery.isFetchingNextPage) {
          auditQuery.fetchNextPage();
        }
      },
      {
        rootMargin: '240px',
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [auditQuery]);

  function updateFilters(patch: Partial<typeof filters>) {
    const next = {
      ...filters,
      ...patch,
    };
    const qs = toAuditQueryString(next);
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  const events = auditQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Audit Log</h2>
      <p className="text-sm text-zinc-600">Infinite feed with filters and CSV export.</p>

      <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-5">
        <input
          aria-label="User ID filter"
          value={filters.userId}
          onChange={(event) => updateFilters({ userId: event.target.value })}
          placeholder="Filter by userId"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          aria-label="Action filter"
          value={filters.action}
          onChange={(event) =>
            updateFilters({ action: event.target.value as typeof filters.action })
          }
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="All">All actions</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="USER_UPDATED">USER_UPDATED</option>
          <option value="USER_SUSPENDED">USER_SUSPENDED</option>
          <option value="ROLE_UPDATED">ROLE_UPDATED</option>
          <option value="LOGIN">LOGIN</option>
        </select>
        <input
          aria-label="From date"
          type="date"
          value={filters.from}
          onChange={(event) => updateFilters({ from: event.target.value })}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          aria-label="To date"
          type="date"
          value={filters.to}
          onChange={(event) => updateFilters({ to: event.target.value })}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
          onClick={() => downloadAuditCsv(events)}
          disabled={events.length === 0}
        >
          Export loaded to CSV
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
          onClick={() => {
            const qs = toAuditQueryString(DEFAULT_AUDIT_FILTERS);
            router.replace(qs ? `${pathname}?${qs}` : pathname);
          }}
        >
          Reset filters
        </button>
      </div>

      {auditQuery.isError ? (
        <div className="text-sm text-red-600">Failed to load audit events.</div>
      ) : null}

      <div className="space-y-2">
        {events.map((event) => {
          const isExpanded = Boolean(expanded[event.id]);
          return (
            <article key={event.id} className="rounded-lg border border-zinc-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(event.timestamp).toLocaleString()} • {event.userId}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [event.id]: !prev[event.id],
                    }))
                  }
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              </div>
              <p className="mt-2 text-sm text-zinc-700">{event.message}</p>
              {isExpanded ? (
                <pre className="mt-2 overflow-auto rounded-md bg-zinc-100 p-2 text-xs">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              ) : null}
            </article>
          );
        })}
      </div>

      <div ref={loadMoreRef} />
      {auditQuery.isFetchingNextPage ? (
        <p className="text-sm text-zinc-500">Loading more...</p>
      ) : null}
      {!auditQuery.hasNextPage && events.length > 0 ? (
        <p className="text-sm text-zinc-500">No more events.</p>
      ) : null}
    </section>
  );
}
