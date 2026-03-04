'use client';

import { bulkUpdateUsersStatus } from '@/entities/user/api/bulk-update-users-status';
import { getUsers } from '@/entities/user/api/get-users';
import {
  DEFAULT_USERS_QUERY,
  parseUsersQueryParams,
  toUsersQueryString,
} from '@/features/users/filters/model/query-params';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function UsersPageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const parsedQuery = useMemo(() => parseUsersQueryParams(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState(parsedQuery.search);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch === parsedQuery.search) {
      return;
    }

    const next = {
      ...parsedQuery,
      page: DEFAULT_USERS_QUERY.page,
      search: debouncedSearch,
    };
    const queryString = toUsersQueryString(next);
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextUrl);
  }, [debouncedSearch, parsedQuery, pathname, router]);

  const usersQuery = useQuery({
    queryKey: ['users', { ...parsedQuery, search: debouncedSearch }],
    queryFn: () =>
      getUsers({
        ...parsedQuery,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
  });

  const bulkMutation = useMutation({
    mutationFn: ({ status, userIds }: { status: 'Active' | 'Suspended'; userIds: string[] }) =>
      bulkUpdateUsersStatus(userIds, status),
    onSuccess: async (_, variables) => {
      setSelectedIds([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['audit'] }),
      ]);
      toast.success(
        variables.status === 'Suspended' ? 'Selected users suspended' : 'Selected users activated',
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bulk update failed');
    },
  });

  function updateQuery(
    patch: Partial<typeof parsedQuery>,
    options?: {
      resetPage?: boolean;
    },
  ) {
    setSelectedIds([]);
    const next = {
      ...parsedQuery,
      ...patch,
      page: options?.resetPage ? 1 : (patch.page ?? parsedQuery.page),
    };

    const queryString = toUsersQueryString(next);
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextUrl);
  }

  const allVisibleSelected =
    (usersQuery.data?.items.length ?? 0) > 0 &&
    usersQuery.data?.items.every((item) => selectedIds.includes(item.id));

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Users</h2>
      <p className="text-sm text-zinc-600">
        Server-side pagination, sorting, filters, bulk actions, and URL-synced state.
      </p>

      <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-6">
        <input
          value={searchInput}
          onChange={(event) => {
            setSelectedIds([]);
            setSearchInput(event.target.value);
          }}
          placeholder="Search by name or email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm xl:col-span-2"
        />

        <select
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={parsedQuery.status}
          onChange={(event) =>
            updateQuery(
              { status: event.target.value as typeof parsedQuery.status },
              { resetPage: true },
            )
          }
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Invited">Invited</option>
        </select>

        <select
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={parsedQuery.role}
          onChange={(event) =>
            updateQuery(
              { role: event.target.value as typeof parsedQuery.role },
              { resetPage: true },
            )
          }
        >
          <option value="All">All roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Viewer">Viewer</option>
        </select>

        <input
          type="date"
          aria-label="Created from"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={parsedQuery.from}
          onChange={(event) => updateQuery({ from: event.target.value }, { resetPage: true })}
        />

        <input
          type="date"
          aria-label="Created to"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={parsedQuery.to}
          onChange={(event) => updateQuery({ to: event.target.value }, { resetPage: true })}
        />

        <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-span-2">
          <select
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            value={parsedQuery.sortBy}
            onChange={(event) =>
              updateQuery(
                { sortBy: event.target.value as typeof parsedQuery.sortBy },
                { resetPage: true },
              )
            }
          >
            <option value="createdAt">Created At</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
          </select>
          <select
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            value={parsedQuery.sortOrder}
            onChange={(event) =>
              updateQuery(
                { sortOrder: event.target.value as typeof parsedQuery.sortOrder },
                { resetPage: true },
              )
            }
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4">
        <span className="text-sm text-zinc-600">Selected: {selectedIds.length}</span>
        <button
          type="button"
          disabled={selectedIds.length === 0 || bulkMutation.isPending}
          onClick={() => bulkMutation.mutate({ status: 'Suspended', userIds: selectedIds })}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bulk Suspend
        </button>
        <button
          type="button"
          disabled={selectedIds.length === 0 || bulkMutation.isPending}
          onClick={() => bulkMutation.mutate({ status: 'Active', userIds: selectedIds })}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bulk Activate
        </button>
      </div>

      {usersQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load users. Please try again.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-zinc-100 text-left text-xs tracking-wide text-zinc-600 uppercase">
            <tr>
              <th className="px-4 py-3">
                <input
                  aria-label="Select all visible users"
                  type="checkbox"
                  checked={Boolean(allVisibleSelected)}
                  onChange={(event) => {
                    if (!usersQuery.data?.items) {
                      return;
                    }
                    if (event.target.checked) {
                      setSelectedIds((prev) =>
                        Array.from(
                          new Set([...prev, ...usersQuery.data.items.map((item) => item.id)]),
                        ),
                      );
                      return;
                    }
                    setSelectedIds([]);
                  }}
                />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {usersQuery.isLoading
              ? Array.from({ length: parsedQuery.pageSize }, (_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-t border-zinc-200">
                    <td className="px-4 py-3 text-zinc-400" colSpan={7}>
                      Loading...
                    </td>
                  </tr>
                ))
              : usersQuery.data?.items.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">
                      <input
                        aria-label={`Select ${user.id}`}
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={(event) => {
                          setSelectedIds((prev) =>
                            event.target.checked
                              ? Array.from(new Set([...prev, user.id]))
                              : prev.filter((id) => id !== user.id),
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{user.status}</td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/users/${user.id}`} className="text-blue-700 hover:underline">
                          View
                        </Link>
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="text-blue-700 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!usersQuery.isLoading && usersQuery.data && usersQuery.data.items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">No users matched your filters.</div>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm">
        <p className="text-zinc-600">
          {usersQuery.data ? `Total: ${usersQuery.data.total} users` : 'Total: ...'}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={(usersQuery.data?.page ?? parsedQuery.page) <= 1 || usersQuery.isFetching}
            onClick={() => updateQuery({ page: parsedQuery.page - 1 })}
          >
            Prev
          </button>
          <span className="text-zinc-700">
            Page {usersQuery.data?.page ?? parsedQuery.page} / {usersQuery.data?.totalPages ?? 1}
          </span>
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              (usersQuery.data?.page ?? parsedQuery.page) >= (usersQuery.data?.totalPages ?? 1) ||
              usersQuery.isFetching
            }
            onClick={() => updateQuery({ page: parsedQuery.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
