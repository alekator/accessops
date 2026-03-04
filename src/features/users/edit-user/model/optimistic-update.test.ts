import { type UsersListResponse, type User } from '@/entities/user/model/schemas';
import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { applyOptimisticUserUpdate } from './optimistic-update';

describe('applyOptimisticUserUpdate', () => {
  it('updates user in detail and list cache and rolls back on demand', () => {
    const queryClient = new QueryClient();

    const baseUser: User = {
      id: 'usr_001',
      name: 'User 001',
      email: 'user001@accessops.dev',
      role: 'Viewer',
      status: 'Active',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    const listCache: UsersListResponse = {
      items: [baseUser],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    };

    queryClient.setQueryData(['user', baseUser.id], baseUser);
    queryClient.setQueryData(['users', { page: 1 }], listCache);

    const rollback = applyOptimisticUserUpdate(queryClient, baseUser.id, {
      name: 'Updated Name',
      status: 'Suspended',
      suspendReason: 'Manual moderation',
    });

    const detailAfter = queryClient.getQueryData<User>(['user', baseUser.id]);
    const listAfter = queryClient.getQueryData<UsersListResponse>(['users', { page: 1 }]);

    expect(detailAfter?.name).toBe('Updated Name');
    expect(detailAfter?.status).toBe('Suspended');
    expect(listAfter?.items[0].name).toBe('Updated Name');
    expect(listAfter?.items[0].status).toBe('Suspended');

    rollback();

    const detailRollback = queryClient.getQueryData<User>(['user', baseUser.id]);
    const listRollback = queryClient.getQueryData<UsersListResponse>(['users', { page: 1 }]);

    expect(detailRollback).toEqual(baseUser);
    expect(listRollback).toEqual(listCache);
  });
});
