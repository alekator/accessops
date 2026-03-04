import { UserSchema } from '@/entities/user/model/schemas';
import { apiRequest } from '@/shared/api/client';

export type UpdateUserInput = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Suspended' | 'Invited';
  suspendReason?: string;
};

export async function updateUser(input: UpdateUserInput) {
  const { id, ...body } = input;
  return apiRequest(`/api/users/${id}`, UserSchema, {
    method: 'PATCH',
    body,
  });
}
