import { createUsersFixture } from '@/mocks/fixtures/users';

const usersDb = createUsersFixture(200);

export function listUsers() {
  return usersDb;
}

export function getUserById(id: string) {
  return usersDb.find((user) => user.id === id) ?? null;
}

export function isEmailUnique(email: string, excludeId?: string) {
  const normalized = email.trim().toLowerCase();
  return !usersDb.some((user) => user.email.toLowerCase() === normalized && user.id !== excludeId);
}

export function updateUserById(
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Viewer';
    status: 'Active' | 'Suspended' | 'Invited';
    suspendReason?: string;
  }>,
) {
  const index = usersDb.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  const previous = usersDb[index];
  const next = {
    ...previous,
    ...patch,
    email: patch.email ? patch.email.trim().toLowerCase() : previous.email,
    suspendReason:
      patch.status && patch.status !== 'Suspended'
        ? undefined
        : patch.suspendReason !== undefined
          ? patch.suspendReason
          : previous.suspendReason,
  };
  usersDb[index] = next;
  return next;
}

export function bulkUpdateUsersStatus(
  userIds: string[],
  status: 'Active' | 'Suspended',
  suspendReason?: string,
) {
  const updatedIds = new Set(userIds);
  const updated = usersDb
    .map((user) => {
      if (!updatedIds.has(user.id)) {
        return null;
      }

      const next = {
        ...user,
        status,
        suspendReason:
          status === 'Suspended' ? (suspendReason ?? 'Bulk moderation update') : undefined,
      };

      const index = usersDb.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        usersDb[index] = next;
      }

      return next;
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  return updated;
}
