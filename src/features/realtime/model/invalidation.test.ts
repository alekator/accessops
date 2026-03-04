import { describe, expect, it } from 'vitest';

import { getInvalidationKeys } from './invalidation';

describe('getInvalidationKeys', () => {
  it('returns user-related keys for USER_UPDATED_BY_OTHER', () => {
    const keys = getInvalidationKeys({
      type: 'USER_UPDATED_BY_OTHER',
      userId: 'usr_001',
      message: 'x',
    });

    expect(keys).toEqual([['users'], ['user', 'usr_001'], ['audit']]);
  });

  it('returns role-related keys for ROLE_POLICY_CHANGED', () => {
    const keys = getInvalidationKeys({
      type: 'ROLE_POLICY_CHANGED',
      roleId: 'role_manager',
      message: 'x',
    });

    expect(keys).toEqual([['roles'], ['audit']]);
  });
});
