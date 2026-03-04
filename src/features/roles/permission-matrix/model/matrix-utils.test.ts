import { describe, expect, it } from 'vitest';

import {
  createEmptyPolicy,
  getPolicyDiff,
  toggleAll,
  toggleCell,
  toggleColumn,
  toggleRow,
} from './matrix-utils';

describe('permission matrix utils', () => {
  it('toggles single cell', () => {
    const base = createEmptyPolicy();
    const updated = toggleCell(base, 'Users', 'Read');
    expect(updated.Users.Read).toBe(true);
    expect(base.Users.Read).toBe(false);
  });

  it('toggles row', () => {
    const base = createEmptyPolicy();
    const updated = toggleRow(base, 'Billing');
    expect(Object.values(updated.Billing).every(Boolean)).toBe(true);
  });

  it('toggles column', () => {
    const base = createEmptyPolicy();
    const updated = toggleColumn(base, 'Export');
    expect(updated.Users.Export).toBe(true);
    expect(updated.Reports.Export).toBe(true);
  });

  it('toggles all permissions', () => {
    const base = createEmptyPolicy();
    const enabled = toggleAll(base);
    expect(enabled.Documents.Delete).toBe(true);
    const disabled = toggleAll(enabled);
    expect(disabled.Documents.Delete).toBe(false);
  });

  it('builds diff list', () => {
    const base = createEmptyPolicy();
    const draft = toggleCell(toggleCell(base, 'Users', 'Read'), 'Reports', 'Export');
    const diff = getPolicyDiff(base, draft);
    expect(diff).toHaveLength(2);
    expect(diff[0]).toMatchObject({
      module: 'Users',
      action: 'Read',
      from: false,
      to: true,
    });
  });
});
