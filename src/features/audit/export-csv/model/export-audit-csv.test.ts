import { describe, expect, it } from 'vitest';

import { buildAuditCsv } from './export-audit-csv';

describe('buildAuditCsv', () => {
  it('renders csv with header and escaped rows', () => {
    const csv = buildAuditCsv([
      {
        id: 'audit_0001',
        timestamp: '2026-01-01T00:00:00.000Z',
        userId: 'usr_001',
        action: 'LOGIN',
        message: 'User "logged in"',
        details: {
          ip: '127.0.0.1',
        },
      },
    ]);

    expect(csv).toContain('"id","timestamp","userId","action","message","details"');
    expect(csv).toContain('"audit_0001"');
    expect(csv).toContain('"User ""logged in"""');
  });
});
