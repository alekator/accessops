import { type PermissionPolicy } from '@/entities/role/model/schemas';
import { RoleRevisionActionResponseSchema } from '@/entities/role/model/revisions';
import { apiRequest } from '@/shared/api/client';

type ProposeRoleRevisionInput = {
  policy: PermissionPolicy;
  actorId: string;
  note?: string;
};

export async function proposeRoleRevision(roleId: string, input: ProposeRoleRevisionInput) {
  return apiRequest(`/api/roles/${roleId}/revisions`, RoleRevisionActionResponseSchema, {
    method: 'POST',
    body: input,
  });
}
