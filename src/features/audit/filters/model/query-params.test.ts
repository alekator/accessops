import { describe, expect, it } from 'vitest';

import { DEFAULT_AUDIT_FILTERS, parseAuditFilters, toAuditQueryString } from './query-params';

describe('audit query params', () => {
  it('parses defaults', () => {
    const parsed = parseAuditFilters(new URLSearchParams());
    expect(parsed).toEqual(DEFAULT_AUDIT_FILTERS);
  });

  it('parses valid params', () => {
    const parsed = parseAuditFilters(
      new URLSearchParams({
        userId: 'usr_001',
        action: 'LOGIN',
        from: '2026-01-01',
        to: '2026-01-31',
      }),
    );
    expect(parsed).toEqual({
      userId: 'usr_001',
      action: 'LOGIN',
      from: '2026-01-01',
      to: '2026-01-31',
    });
  });

  it('serializes only changed fields', () => {
    const query = toAuditQueryString({
      ...DEFAULT_AUDIT_FILTERS,
      action: 'ROLE_UPDATED',
      userId: 'usr_002',
    });
    expect(query).toContain('action=ROLE_UPDATED');
    expect(query).toContain('userId=usr_002');
    expect(query).not.toContain('from=');
  });
});
