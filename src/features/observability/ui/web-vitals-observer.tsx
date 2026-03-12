'use client';

import { logInfo, logWarn } from '@/features/observability/model/client-logger';
import { useEffect } from 'react';

type PerfEntry = PerformanceEntry & {
  value?: number;
  hadRecentInput?: boolean;
};

export function WebVitalsObserver() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return;
    }

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerfEntry | undefined;
      if (!last) {
        return;
      }
      const value = Math.round(last.startTime);
      logInfo('web_vital_lcp', { value }, 'performance');
      if (value > 2500) {
        logWarn('performance_budget_lcp_exceeded', { value, budget: 2500 }, 'performance');
      }
    });

    const clsObserver = new PerformanceObserver((list) => {
      let cls = 0;
      list.getEntries().forEach((entry) => {
        const perf = entry as PerfEntry;
        if (!perf.hadRecentInput && perf.value) {
          cls += perf.value;
        }
      });
      if (cls > 0) {
        const rounded = Number(cls.toFixed(3));
        logInfo('web_vital_cls', { value: rounded }, 'performance');
        if (rounded > 0.1) {
          logWarn(
            'performance_budget_cls_exceeded',
            { value: rounded, budget: 0.1 },
            'performance',
          );
        }
      }
    });

    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as Array<PerformanceEventTiming>;
      if (entries.length === 0) {
        return;
      }
      const longest = entries.reduce((acc, entry) => Math.max(acc, entry.duration), 0);
      const rounded = Math.round(longest);
      logInfo('web_vital_inp', { value: rounded }, 'performance');
      if (rounded > 200) {
        logWarn('performance_budget_inp_exceeded', { value: rounded, budget: 200 }, 'performance');
      }
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      inpObserver.observe({ type: 'event', buffered: true });
    } catch {
      // Browser does not support one of observers.
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  return null;
}
