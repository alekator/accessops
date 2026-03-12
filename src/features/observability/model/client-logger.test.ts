import { beforeEach, describe, expect, it } from 'vitest';

import { clearLogs, getRecentLogs, logError, resolveLogCategoryFromError } from './client-logger';

describe('client logger', () => {
  beforeEach(() => {
    clearLogs();
  });

  it('classifies auth and permission errors', () => {
    expect(resolveLogCategoryFromError({ status: 401 })).toBe('auth');
    expect(resolveLogCategoryFromError({ status: 403 })).toBe('permission');
  });

  it('classifies validation/network/backend errors', () => {
    expect(resolveLogCategoryFromError({ status: 400 })).toBe('validation');
    expect(resolveLogCategoryFromError({ status: 0, code: 'NETWORK_ERROR' })).toBe('network');
    expect(resolveLogCategoryFromError({ status: 500 })).toBe('backend');
  });

  it('stores recent logs in reverse chronological order', () => {
    logError('event_one', { seq: 1 }, 'unknown');
    logError('event_two', { seq: 2 }, 'network');

    const entries = getRecentLogs(2);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.event).toBe('event_two');
    expect(entries[1]?.event).toBe('event_one');
  });
});
