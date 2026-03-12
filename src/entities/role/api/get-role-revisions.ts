import { RoleRevisionsResponseSchema } from '@/entities/role/model/revisions';
import { apiRequest } from '@/shared/api/client';

export async function getRoleRevisions(roleId: string) {
  return apiRequest(`/api/roles/${roleId}/revisions`, RoleRevisionsResponseSchema);
}
