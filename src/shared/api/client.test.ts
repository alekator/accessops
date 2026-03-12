import { describe, expect, it } from 'vitest';

import { buildApiUrl, normalizeApiPath } from './client';

describe('normalizeApiPath', () => {
  it('keeps v1 path unchanged', () => {
    expect(normalizeApiPath('/api/v1/users')).toBe('/api/v1/users');
  });

  it('rewrites /api to /api/v1', () => {
    expect(normalizeApiPath('/api/roles')).toBe('/api/v1/roles');
  });

  it('prepends /api/v1 for root paths', () => {
    expect(normalizeApiPath('/audit')).toBe('/api/v1/audit');
  });

  it('passes through absolute urls', () => {
    const url = 'https://example.test/api/v1/users';
    expect(normalizeApiPath(url)).toBe(url);
  });
});

describe('buildApiUrl', () => {
  it('adds query params and skips empty values', () => {
    const url = buildApiUrl('/api/roles', {
      page: 2,
      search: 'admin',
      empty: '',
      missing: undefined,
    });
    expect(url).toContain('/api/v1/roles');
    expect(url).toContain('page=2');
    expect(url).toContain('search=admin');
    expect(url).not.toContain('empty=');
    expect(url).not.toContain('missing=');
  });

  it('builds from absolute urls', () => {
    const url = buildApiUrl('https://example.test/api/v1/users', { role: 'Admin' });
    expect(url).toBe('https://example.test/api/v1/users?role=Admin');
  });
});
