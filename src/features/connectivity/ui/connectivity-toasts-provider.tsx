'use client';

import { logInfo } from '@/features/observability/model/client-logger';
import { useNetworkStatus } from '@/shared/lib/use-network-status';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function ConnectivityToastsProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useNetworkStatus();
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (prev.current === null) {
      prev.current = isOnline;
      return;
    }

    if (prev.current !== isOnline) {
      if (isOnline) {
        logInfo('connectivity_online', undefined, 'network');
        toast.success('Connection restored');
      } else {
        logInfo('connectivity_offline', undefined, 'network');
        toast.error('You are offline');
      }
      prev.current = isOnline;
    }
  }, [isOnline]);

  return children;
}
