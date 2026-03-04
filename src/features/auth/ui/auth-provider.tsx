'use client';

import { authenticateDemoUser } from '@/features/auth/model/credentials';
import { clearPersistedSession, loadSessionFromStorage, persistSession } from '@/features/auth/model/session';
import { ROLES, type Role, type Session } from '@/shared/types/auth';
import { createContext, useContext, useMemo, useState } from 'react';

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  session: Session | null;
  role: Role | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  switchRole: (nextRole: Role) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSessionFromStorage());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      role: session?.role ?? null,
      isAuthenticated: Boolean(session),
      isBootstrapped: true,
      async login(input) {
        const nextSession = authenticateDemoUser(input.email, input.password);
        persistSession(nextSession);
        setSession(nextSession);
      },
      logout() {
        clearPersistedSession();
        setSession(null);
      },
      switchRole(nextRole) {
        if (!session || !ROLES.includes(nextRole)) {
          return;
        }
        const nextSession = { ...session, role: nextRole };
        persistSession(nextSession);
        setSession(nextSession);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
