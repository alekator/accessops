'use client';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/ui/auth-provider';
import { RealtimeEventsProvider } from '@/features/realtime/ui/realtime-events-provider';
import { initMocks } from '@/mocks/init';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [isMocksReady, setIsMocksReady] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    initMocks().finally(() => {
      setIsMocksReady(true);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeEventsProvider>
        <AuthProvider>
          {isMocksReady ? children : null}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </RealtimeEventsProvider>
    </QueryClientProvider>
  );
}
