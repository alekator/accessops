'use client';

import { ROLE_COOKIE_KEY, SESSION_STORAGE_KEY } from '@/features/auth/model/constants';
import { type Session } from '@/shared/types/auth';

function isSession(payload: unknown): payload is Session {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const obj = payload as Record<string, unknown>;
  return (
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    (obj.role === 'Admin' || obj.role === 'Manager' || obj.role === 'Viewer')
  );
}

export function loadSessionFromStorage(): Session | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function persistSession(session: Session) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  document.cookie = `${ROLE_COOKIE_KEY}=${session.role}; path=/; max-age=604800; samesite=lax`;
}

export function clearPersistedSession() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
