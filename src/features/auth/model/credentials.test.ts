import { describe, expect, it } from 'vitest';

import { authenticateDemoUser, getDemoAccounts } from './credentials';

describe('authenticateDemoUser', () => {
  it('returns session for valid credentials', () => {
    const session = authenticateDemoUser('admin@accessops.dev', 'demo123');
    expect(session).toEqual({
      email: 'admin@accessops.dev',
      name: 'Alex Admin',
      role: 'Admin',
    });
  });

  it('normalizes email to lowercase', () => {
    const session = authenticateDemoUser('MANAGER@ACCESSOPS.DEV', 'demo123');
    expect(session.role).toBe('Manager');
  });

  it('throws for invalid credentials', () => {
    expect(() => authenticateDemoUser('admin@accessops.dev', 'wrong')).toThrow(
      'Invalid credentials. Use one of demo accounts.',
    );
  });
});

describe('getDemoAccounts', () => {
  it('returns account list without names', () => {
    const accounts = getDemoAccounts();
    expect(accounts).toHaveLength(3);
    expect(accounts[0]).toEqual({
      email: 'admin@accessops.dev',
      password: 'demo123',
      role: 'Admin',
    });
  });
});
