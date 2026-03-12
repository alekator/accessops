import { describe, expect, it } from 'vitest';

import { PermissionPolicySchema } from './schemas';

const validPolicy = {
  Users: { Read: true, Write: false, Delete: false, Export: true, Admin: false },
  Billing: { Read: true, Write: false, Delete: false, Export: false, Admin: false },
  Documents: { Read: true, Write: true, Delete: false, Export: false, Admin: false },
  Reports: { Read: true, Write: false, Delete: false, Export: true, Admin: false },
};

describe('PermissionPolicySchema', () => {
  it('accepts a complete policy matrix', () => {
    const parsed = PermissionPolicySchema.safeParse(validPolicy);
    expect(parsed.success).toBe(true);
  });

  it('rejects missing module', () => {
    const missingModule: Record<string, unknown> = { ...validPolicy };
    delete missingModule.Reports;
    const parsed = PermissionPolicySchema.safeParse(missingModule);
    expect(parsed.success).toBe(false);
  });

  it('rejects missing action in module', () => {
    const invalid = {
      ...validPolicy,
      Users: { Read: true, Delete: false, Export: true, Admin: false },
    };
    const parsed = PermissionPolicySchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects non-boolean permission values', () => {
    const invalid = {
      ...validPolicy,
      Billing: { ...validPolicy.Billing, Write: 'yes' },
    };
    const parsed = PermissionPolicySchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
