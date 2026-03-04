import { Suspense } from 'react';

import { UsersPageClient } from './users-page-client';

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading users...</div>}>
      <UsersPageClient />
    </Suspense>
  );
}
