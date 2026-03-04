import { describe, expect, it } from 'vitest';

import { isProtectedRoute, resolveRouteAccess } from './rbac';

describe('isProtectedRoute', () => {
  it('detects protected dashboard routes', () => {
    expect(isProtectedRoute('/users')).toBe(true);
    expect(isProtectedRoute('/roles/123')).toBe(true);
    expect(isProtectedRoute('/audit?page=2')).toBe(true);
  });

  it('ignores public routes', () => {
    expect(isProtectedRoute('/')).toBe(false);
    expect(isProtectedRoute('/login')).toBe(false);
  });
});

describe('resolveRouteAccess', () => {
  it('redirects unauthenticated user to login', () => {
    expect(resolveRouteAccess('/users', null)).toEqual({
      allowed: false,
      redirectTo: '/login',
    });
  });

  it('blocks Viewer from roles editor', () => {
    expect(resolveRouteAccess('/roles', 'Viewer')).toEqual({
      allowed: false,
      redirectTo: '/users',
    });
  });

  it('allows Manager to access roles page in read mode', () => {
    expect(resolveRouteAccess('/roles', 'Manager')).toEqual({ allowed: true });
  });

  it('allows Admin to access protected pages', () => {
    expect(resolveRouteAccess('/users', 'Admin')).toEqual({ allowed: true });
    expect(resolveRouteAccess('/audit', 'Admin')).toEqual({ allowed: true });
  });
});
