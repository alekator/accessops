import { type Role } from '@/shared/types/auth';

const PROTECTED_PREFIXES = ['/users', '/roles', '/audit'];

type AccessResult =
  | { allowed: true }
  | {
      allowed: false;
      redirectTo: string;
    };

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function resolveRouteAccess(pathname: string, role: Role | null): AccessResult {
  if (!isProtectedRoute(pathname)) {
    return { allowed: true };
  }

  if (!role) {
    return { allowed: false, redirectTo: '/login' };
  }

  if (pathname.startsWith('/roles') && role === 'Viewer') {
    return { allowed: false, redirectTo: '/users' };
  }

  return { allowed: true };
}
