import { RoleRevisionActionResponseSchema } from '@/entities/role/model/revisions';
import { apiRequest } from '@/shared/api/client';

type RollbackRolePolicyInput = {
  actorId: string;
};

export async function rollbackRolePolicy(
  roleId: string,
  targetRevisionId: string,
  input: RollbackRolePolicyInput,
) {
  return apiRequest(
    `/api/roles/${roleId}/revisions/${targetRevisionId}/rollback`,
    RoleRevisionActionResponseSchema,
    {
      method: 'POST',
      body: input,
    },
  );
}
