import { type UsersQueryParams } from '@/entities/user/api/get-users';
import { UserRoleSchema, UserStatusSchema } from '@/entities/user/model/schemas';

export const DEFAULT_USERS_QUERY: UsersQueryParams = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'All',
  role: 'All',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

type QueryLike = {
  get: (name: string) => string | null;
};

export function parseUsersQueryParams(input: QueryLike): UsersQueryParams {
  const statusRaw = input.get('status');
  const roleRaw = input.get('role');
  const sortByRaw = input.get('sortBy');
  const sortOrderRaw = input.get('sortOrder');

  const status = statusRaw === 'All' || UserStatusSchema.safeParse(statusRaw).success ? statusRaw : null;
  const role = roleRaw === 'All' || UserRoleSchema.safeParse(roleRaw).success ? roleRaw : null;

  return {
    page: parsePositiveInt(input.get('page'), DEFAULT_USERS_QUERY.page),
    pageSize: parsePositiveInt(input.get('pageSize'), DEFAULT_USERS_QUERY.pageSize),
    search: input.get('search') ?? DEFAULT_USERS_QUERY.search,
    status: (status as UsersQueryParams['status'] | null) ?? DEFAULT_USERS_QUERY.status,
    role: (role as UsersQueryParams['role'] | null) ?? DEFAULT_USERS_QUERY.role,
    sortBy:
      sortByRaw === 'name' || sortByRaw === 'email' || sortByRaw === 'createdAt'
        ? sortByRaw
        : DEFAULT_USERS_QUERY.sortBy,
    sortOrder: sortOrderRaw === 'asc' || sortOrderRaw === 'desc' ? sortOrderRaw : DEFAULT_USERS_QUERY.sortOrder,
  };
}

export function toUsersQueryString(query: UsersQueryParams): string {
  const params = new URLSearchParams();

  if (query.page !== DEFAULT_USERS_QUERY.page) {
    params.set('page', String(query.page));
  }
  if (query.pageSize !== DEFAULT_USERS_QUERY.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }
  if (query.search !== DEFAULT_USERS_QUERY.search) {
    params.set('search', query.search);
  }
  if (query.status !== DEFAULT_USERS_QUERY.status) {
    params.set('status', query.status);
  }
  if (query.role !== DEFAULT_USERS_QUERY.role) {
    params.set('role', query.role);
  }
  if (query.sortBy !== DEFAULT_USERS_QUERY.sortBy) {
    params.set('sortBy', query.sortBy);
  }
  if (query.sortOrder !== DEFAULT_USERS_QUERY.sortOrder) {
    params.set('sortOrder', query.sortOrder);
  }

  return params.toString();
}
