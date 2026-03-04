import { type User, type UserRole, type UserStatus } from '@/entities/user/model/schemas';

const roles: UserRole[] = ['Admin', 'Manager', 'Viewer'];
const statuses: UserStatus[] = ['Active', 'Suspended', 'Invited'];

function pad(n: number) {
  return String(n).padStart(3, '0');
}

function seededDate(index: number): string {
  const base = new Date('2025-01-01T00:00:00.000Z').getTime();
  const step = 1000 * 60 * 60 * 24;
  return new Date(base + index * step).toISOString();
}

export function createUsersFixture(count = 200): User[] {
  return Array.from({ length: count }, (_, idx) => {
    const id = idx + 1;
    const role = roles[idx % roles.length];
    const status = statuses[idx % statuses.length];
    const suffix = pad(id);
    return {
      id: `usr_${suffix}`,
      name: `User ${suffix}`,
      email: `user${suffix}@accessops.dev`,
      role,
      status,
      suspendReason: status === 'Suspended' ? 'Policy violation' : undefined,
      createdAt: seededDate(id),
    };
  });
}
