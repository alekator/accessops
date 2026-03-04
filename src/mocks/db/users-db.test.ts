import { describe, expect, it } from 'vitest';

import { bulkUpdateUsersStatus, getUserById } from './users-db';

describe('bulkUpdateUsersStatus', () => {
  it('updates selected users to Suspended', () => {
    const before = getUserById('usr_001');
    expect(before?.status).toBeDefined();

    const updated = bulkUpdateUsersStatus(['usr_001', 'usr_002'], 'Suspended', 'Bulk test');

    expect(updated).toHaveLength(2);
    expect(getUserById('usr_001')?.status).toBe('Suspended');
    expect(getUserById('usr_001')?.suspendReason).toBe('Bulk test');
  });

  it('reactivates selected users', () => {
    const updated = bulkUpdateUsersStatus(['usr_001'], 'Active');
    expect(updated[0]?.status).toBe('Active');
    expect(getUserById('usr_001')?.suspendReason).toBeUndefined();
  });
});
