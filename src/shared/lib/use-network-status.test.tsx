import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useNetworkStatus } from './use-network-status';

describe('useNetworkStatus', () => {
  it('reacts to online/offline browser events', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
