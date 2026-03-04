'use client';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/ui/auth-provider';
import { ConnectivityToastsProvider } from '@/features/connectivity/ui/connectivity-toasts-provider';
import { WebVitalsObserver } from '@/features/observability/ui/web-vitals-observer';
import { RealtimeEventsProvider } from '@/features/realtime/ui/realtime-events-provider';
import { initMocks } from '@/mocks/init';
import { shouldRetryQuery } from '@/shared/lib/retry-policy';
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
            retry: shouldRetryQuery,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
          },
          mutations: {
            retry: false,
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
      <ConnectivityToastsProvider>
        <RealtimeEventsProvider>
          <AuthProvider>
            {isMocksReady ? children : null}
            <WebVitalsObserver />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </RealtimeEventsProvider>
      </ConnectivityToastsProvider>
    </QueryClientProvider>
  );
}
