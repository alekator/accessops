import { type PermissionPolicy } from '@/entities/role/model/schemas';
import { createRolesFixture } from '@/mocks/fixtures/roles';

const rolesDb = createRolesFixture();

export function listRoles() {
  return rolesDb;
}

export function getRoleById(roleId: string) {
  return rolesDb.find((role) => role.id === roleId) ?? null;
}

export function updateRolePolicyById(roleId: string, policy: PermissionPolicy) {
  const index = rolesDb.findIndex((role) => role.id === roleId);
  if (index < 0) {
    return null;
  }
  rolesDb[index] = {
    ...rolesDb[index],
    policy,
  };
  return rolesDb[index];
}
