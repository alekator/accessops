import { describe, expect, it } from 'vitest';

import { DEFAULT_USERS_QUERY, parseUsersQueryParams, toUsersQueryString } from './query-params';

describe('parseUsersQueryParams', () => {
  it('returns defaults for empty params', () => {
    const parsed = parseUsersQueryParams(new URLSearchParams());
    expect(parsed).toEqual(DEFAULT_USERS_QUERY);
  });

  it('parses valid params', () => {
    const params = new URLSearchParams({
      page: '3',
      pageSize: '25',
      search: 'alex',
      status: 'Active',
      role: 'Manager',
      from: '2025-01-01',
      to: '2025-01-31',
      sortBy: 'name',
      sortOrder: 'asc',
    });

    const parsed = parseUsersQueryParams(params);
    expect(parsed).toEqual({
      page: 3,
      pageSize: 25,
      search: 'alex',
      status: 'Active',
      role: 'Manager',
      from: '2025-01-01',
      to: '2025-01-31',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('falls back for invalid values', () => {
    const params = new URLSearchParams({
      page: '-1',
      pageSize: '0',
      status: 'NOPE',
      role: 'NOPE',
      sortBy: 'none',
      sortOrder: 'none',
    });

    const parsed = parseUsersQueryParams(params);
    expect(parsed).toEqual(DEFAULT_USERS_QUERY);
  });
});

describe('toUsersQueryString', () => {
  it('omits default values', () => {
    expect(toUsersQueryString(DEFAULT_USERS_QUERY)).toBe('');
  });

  it('serializes only changed fields', () => {
    const result = toUsersQueryString({
      ...DEFAULT_USERS_QUERY,
      page: 2,
      status: 'Suspended',
      from: '2025-02-01',
      sortBy: 'name',
    });

    expect(result).toContain('page=2');
    expect(result).toContain('status=Suspended');
    expect(result).toContain('from=2025-02-01');
    expect(result).toContain('sortBy=name');
    expect(result).not.toContain('pageSize=');
  });
});
