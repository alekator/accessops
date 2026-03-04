import { UserSchema } from '@/entities/user/model/schemas';
import { apiRequest } from '@/shared/api/client';

export async function getUser(id: string) {
  return apiRequest(`/api/users/${id}`, UserSchema);
}
