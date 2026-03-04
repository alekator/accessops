'use client';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/ui/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
