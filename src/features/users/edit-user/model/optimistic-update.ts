import { type UsersListResponse, type User } from '@/entities/user/model/schemas';
import { type QueryClient } from '@tanstack/react-query';

type RollbackFn = () => void;

export function applyOptimisticUserUpdate(
  queryClient: QueryClient,
  userId: string,
  patch: Partial<User>,
): RollbackFn {
  const previousDetail = queryClient.getQueryData<User>(['user', userId]);
  const previousLists = queryClient.getQueriesData<UsersListResponse>({
    queryKey: ['users'],
  });

  if (previousDetail) {
    queryClient.setQueryData<User>(['user', userId], {
      ...previousDetail,
      ...patch,
    });
  }

  previousLists.forEach(([key, data]) => {
    if (!data) {
      return;
    }

    queryClient.setQueryData<UsersListResponse>(key, {
      ...data,
      items: data.items.map((item) => (item.id === userId ? { ...item, ...patch } : item)),
    });
  });

  return () => {
    queryClient.setQueryData(['user', userId], previousDetail);
    previousLists.forEach(([key, data]) => {
      queryClient.setQueryData(key, data);
    });
  };
}
