import { RoleRevisionActionResponseSchema } from '@/entities/role/model/revisions';
import { apiRequest } from '@/shared/api/client';

type RejectRoleRevisionInput = {
  actorId: string;
  reason?: string;
};

export async function rejectRoleRevision(
  roleId: string,
  revisionId: string,
  input: RejectRoleRevisionInput,
) {
  return apiRequest(
    `/api/roles/${roleId}/revisions/${revisionId}/reject`,
    RoleRevisionActionResponseSchema,
    {
      method: 'POST',
      body: input,
    },
  );
}
