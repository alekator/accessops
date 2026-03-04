import { UsersListResponseSchema, type UserStatus } from '@/entities/user/model/schemas';
import { apiRequest } from '@/shared/api/client';

export async function bulkUpdateUsersStatus(
  userIds: string[],
  status: Extract<UserStatus, 'Active' | 'Suspended'>,
) {
  return apiRequest('/api/users/bulk-status', UsersListResponseSchema, {
    method: 'POST',
    body: {
      userIds,
      status,
    },
  });
}
