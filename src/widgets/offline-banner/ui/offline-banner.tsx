'use client';

import { useNetworkStatus } from '@/shared/lib/use-network-status';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
      You are offline. Some actions may fail until connection is restored.
    </div>
  );
}
