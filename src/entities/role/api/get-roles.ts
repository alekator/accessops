import { RolesListResponseSchema } from '@/entities/role/model/schemas';
import { apiRequest } from '@/shared/api/client';

export async function getRoles() {
  return apiRequest('/api/roles', RolesListResponseSchema);
}
