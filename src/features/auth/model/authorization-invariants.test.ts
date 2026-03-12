import { describe, expect, it } from 'vitest';

import { RoleSchema } from '@/entities/role/model/schemas';
import { createRolesFixture } from '@/mocks/fixtures/roles';

import { resolveRouteAccess } from './rbac';

describe('authorization invariants', () => {
  it('keeps exactly one role definition per expected role', () => {
    const roles = createRolesFixture();

    expect(roles).toHaveLength(3);
    expect(roles.map((role) => role.name).sort()).toEqual(['Admin', 'Manager', 'Viewer']);
  });

  it('keeps all fixture roles schema-valid', () => {
    const roles = createRolesFixture();

    roles.forEach((role) => {
      const parsed = RoleSchema.safeParse(role);
      expect(parsed.success).toBe(true);
    });
  });

  it('enforces stable route access matrix', () => {
    expect(resolveRouteAccess('/roles', 'Admin')).toEqual({ allowed: true });
    expect(resolveRouteAccess('/roles', 'Manager')).toEqual({ allowed: true });
    expect(resolveRouteAccess('/roles', 'Viewer')).toEqual({
      allowed: false,
      redirectTo: '/users',
    });

    expect(resolveRouteAccess('/users', 'Viewer')).toEqual({ allowed: true });
    expect(resolveRouteAccess('/audit', 'Viewer')).toEqual({ allowed: true });
  });
});
