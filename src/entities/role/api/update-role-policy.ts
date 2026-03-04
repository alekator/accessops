import { type PermissionPolicy, RoleSchema } from '@/entities/role/model/schemas';
import { apiRequest } from '@/shared/api/client';

export async function updateRolePolicy(roleId: string, policy: PermissionPolicy) {
  return apiRequest(`/api/roles/${roleId}`, RoleSchema, {
    method: 'PATCH',
    body: { policy },
  });
}
