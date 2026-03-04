import { describe, expect, it, vi } from 'vitest';

import { emitRealtimeEvent, subscribeToRealtimeEvents } from './event-bus';

describe('realtime event bus', () => {
  it('notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToRealtimeEvents(listener);

    emitRealtimeEvent({
      type: 'USER_UPDATED_BY_OTHER',
      userId: 'usr_001',
      message: 'changed',
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: 'USER_UPDATED_BY_OTHER',
      userId: 'usr_001',
      message: 'changed',
    });

    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToRealtimeEvents(listener);
    unsubscribe();

    emitRealtimeEvent({
      type: 'ROLE_POLICY_CHANGED',
      roleId: 'role_admin',
      message: 'changed',
    });

    expect(listener).not.toHaveBeenCalled();
  });
});
