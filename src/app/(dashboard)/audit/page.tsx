import { Suspense } from 'react';

import { AuditPageClient } from './audit-page-client';

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading audit...</div>}>
      <AuditPageClient />
    </Suspense>
  );
}
