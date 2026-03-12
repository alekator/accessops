'use client';

import {
  clearLogs,
  getLogsSnapshot,
  subscribeToLogs,
  type LogCategory,
} from '@/features/observability/model/client-logger';
import { API_BASE_URL, API_MODE } from '@/shared/config/runtime';
import { useNetworkStatus } from '@/shared/lib/use-network-status';
import { useSyncExternalStore, useState } from 'react';

const CATEGORY_OPTIONS: Array<LogCategory | 'all'> = [
  'all',
  'auth',
  'permission',
  'validation',
  'network',
  'backend',
  'performance',
  'unknown',
];
const EMPTY_LOGS: ReturnType<typeof getLogsSnapshot> = [];

function useRecentLogs(limit = 40) {
  const snapshot = useSyncExternalStore(subscribeToLogs, getLogsSnapshot, () => EMPTY_LOGS);
  return snapshot.slice(0, limit);
}

export function DevDiagnosticsPanel() {
  const isDev = process.env.NODE_ENV === 'development';
  const { isOnline } = useNetworkStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<LogCategory | 'all'>('all');
  const logs = useRecentLogs(60);

  if (!isDev) {
    return null;
  }

  const filteredLogs =
    category === 'all' ? logs : logs.filter((entry) => entry.category === category);

  return (
    <div className="fixed right-3 bottom-3 z-50 w-[340px] max-w-[calc(100vw-24px)]">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full rounded-t-lg bg-zinc-900 px-3 py-2 text-left text-xs font-medium text-white"
      >
        Diagnostics ({filteredLogs.length}) | {isOnline ? 'online' : 'offline'} | {API_MODE}
      </button>
      {isOpen ? (
        <section className="rounded-b-lg border border-zinc-300 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
            <p className="text-zinc-600">
              mode: <strong>{API_MODE}</strong>
              {API_MODE === 'api' ? ` (${API_BASE_URL || 'same-origin'})` : ' (MSW)'}
            </p>
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
              onClick={() => clearLogs()}
            >
              Clear
            </button>
          </div>

          <div className="mb-2">
            <label htmlFor="diag-category" className="sr-only">
              Log category
            </label>
            <select
              id="diag-category"
              className="w-full rounded border border-zinc-300 px-2 py-1 text-xs"
              value={category}
              onChange={(event) => setCategory(event.target.value as LogCategory | 'all')}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <ul className="max-h-56 space-y-1 overflow-auto text-xs">
            {filteredLogs.length === 0 ? (
              <li className="text-zinc-500">No diagnostics events.</li>
            ) : (
              filteredLogs.map((entry) => (
                <li key={entry.id} className="rounded border border-zinc-200 p-2">
                  <p className="font-medium text-zinc-800">
                    {entry.event} [{entry.level}/{entry.category}]
                  </p>
                  <p className="text-zinc-500">{entry.timestamp}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
