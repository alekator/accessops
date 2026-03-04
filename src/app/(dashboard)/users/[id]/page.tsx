'use client';

import { getUser } from '@/entities/user/api/get-user';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  });

  if (userQuery.isLoading) {
    return <div className="text-sm text-zinc-500">Loading user...</div>;
  }

  if (userQuery.isError || !userQuery.data) {
    return <div className="text-sm text-red-600">Unable to load user.</div>;
  }

  const user = userQuery.data;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">User Details</h2>
        <div className="flex gap-2">
          <Link href="/users" className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100">
            Back to users
          </Link>
          <Link
            href={`/users/${user.id}/edit`}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Edit user
          </Link>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-2">
        <Info label="Name" value={user.name} />
        <Info label="Email" value={user.email} />
        <Info label="Role" value={user.role} />
        <Info label="Status" value={user.status} />
        <Info label="Created at" value={new Date(user.createdAt).toLocaleString()} />
        <Info label="Suspend reason" value={user.suspendReason || '—'} />
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-900">{value}</p>
    </div>
  );
}
