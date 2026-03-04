import { UsersListResponseSchema, type UserRole, type UserStatus } from '@/entities/user/model/schemas';
import { apiRequest } from '@/shared/api/client';

export type UsersQueryParams = {
  page: number;
  pageSize: number;
  search: string;
  status: UserStatus | 'All';
  role: UserRole | 'All';
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};

export async function getUsers(query: UsersQueryParams) {
  return apiRequest('/api/users', UsersListResponseSchema, {
    query: {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search || undefined,
      status: query.status === 'All' ? undefined : query.status,
      role: query.role === 'All' ? undefined : query.role,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    },
  });
}
