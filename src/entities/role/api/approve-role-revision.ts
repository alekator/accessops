import { RoleRevisionActionResponseSchema } from '@/entities/role/model/revisions';
import { apiRequest } from '@/shared/api/client';

type ApproveRoleRevisionInput = {
  actorId: string;
};

export async function approveRoleRevision(
  roleId: string,
  revisionId: string,
  input: ApproveRoleRevisionInput,
) {
  return apiRequest(
    `/api/roles/${roleId}/revisions/${revisionId}/approve`,
    RoleRevisionActionResponseSchema,
    {
      method: 'POST',
      body: input,
    },
  );
}
