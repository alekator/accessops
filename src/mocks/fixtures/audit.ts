import { type AuditAction, type AuditEvent } from '@/entities/audit/model/schemas';

const ACTIONS: AuditAction[] = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_SUSPENDED',
  'ROLE_UPDATED',
  'LOGIN',
];

export function createAuditFixture(count = 500): AuditEvent[] {
  const base = new Date('2026-01-01T00:00:00.000Z').getTime();
  const step = 1000 * 60 * 30;

  return Array.from({ length: count }, (_, idx) => {
    const id = idx + 1;
    const action = ACTIONS[(idx + 1) % ACTIONS.length];
    const userNum = ((idx % 200) + 1).toString().padStart(3, '0');
    const timestamp = new Date(base - idx * step).toISOString();

    return {
      id: `audit_${id.toString().padStart(4, '0')}`,
      timestamp,
      userId: `usr_${userNum}`,
      action,
      message: `${action} by usr_${userNum}`,
      details: {
        entityId: `usr_${userNum}`,
        actor: `user${userNum}@accessops.dev`,
        index: id,
        successful: idx % 7 !== 0,
      },
    };
  });
}
