'use client';

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
        toast.success('Connection restored');
      } else {
        toast.error('You are offline');
      }
      prev.current = isOnline;
    }
  }, [isOnline]);

  return children;
}
