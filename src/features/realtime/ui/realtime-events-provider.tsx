'use client';

import { getInvalidationKeys } from '@/features/realtime/model/invalidation';
import { emitRandomRealtimeEvent, subscribeToRealtimeEvents } from '@/mocks/ws/event-bus';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function RealtimeEventsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeEvents((event) => {
      toast.info(event.message);
      const keys = getInvalidationKeys(event);
      keys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    });

    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const timer = window.setInterval(() => {
      emitRandomRealtimeEvent();
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return children;
}
