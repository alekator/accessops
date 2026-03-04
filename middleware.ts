import { resolveRouteAccess } from '@/features/auth/model/rbac';
import { ROLE_COOKIE_KEY } from '@/features/auth/model/constants';
import { type Role } from '@/shared/types/auth';
import { NextResponse, type NextRequest } from 'next/server';

function getRoleFromRequest(request: NextRequest): Role | null {
  const role = request.cookies.get(ROLE_COOKIE_KEY)?.value;
  if (role === 'Admin' || role === 'Manager' || role === 'Viewer') {
    return role;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const role = getRoleFromRequest(request);

  if (pathname === '/login' && role) {
    return NextResponse.redirect(new URL('/users', request.url));
  }

  const decision = resolveRouteAccess(pathname, role);
  if (!decision.allowed) {
    const url = new URL(decision.redirectTo, request.url);
    if (decision.redirectTo === '/login') {
      url.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/users/:path*', '/roles/:path*', '/audit/:path*'],
};
