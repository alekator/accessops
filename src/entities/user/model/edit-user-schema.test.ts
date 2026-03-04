import { describe, expect, it } from 'vitest';

import { EditUserFormSchema } from './edit-user-schema';

describe('EditUserFormSchema', () => {
  it('requires suspendReason when user is Suspended', () => {
    const result = EditUserFormSchema.safeParse({
      name: 'Alex',
      email: 'alex@accessops.dev',
      role: 'Viewer',
      status: 'Suspended',
      suspendReason: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'suspendReason')).toBe(true);
    }
  });

  it('passes when suspendReason is provided for Suspended status', () => {
    const result = EditUserFormSchema.safeParse({
      name: 'Alex',
      email: 'alex@accessops.dev',
      role: 'Viewer',
      status: 'Suspended',
      suspendReason: 'Security policy breach',
    });

    expect(result.success).toBe(true);
  });
});
