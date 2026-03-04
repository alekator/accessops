import { type Role, type Session } from '@/shared/types/auth';

type DemoAccount = {
  email: string;
  password: string;
  name: string;
  role: Role;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@accessops.dev',
    password: 'demo123',
    name: 'Alex Admin',
    role: 'Admin',
  },
  {
    email: 'manager@accessops.dev',
    password: 'demo123',
    name: 'Mira Manager',
    role: 'Manager',
  },
  {
    email: 'viewer@accessops.dev',
    password: 'demo123',
    name: 'Vik Viewer',
    role: 'Viewer',
  },
];

export function authenticateDemoUser(email: string, password: string): Session {
  const normalized = email.trim().toLowerCase();
  const match = DEMO_ACCOUNTS.find(
    (account) => account.email === normalized && account.password === password,
  );

  if (!match) {
    throw new Error('Invalid credentials. Use one of demo accounts.');
  }

  return {
    email: match.email,
    name: match.name,
    role: match.role,
  };
}

export function getDemoAccounts() {
  return DEMO_ACCOUNTS.map(({ email, password, role }) => ({ email, password, role }));
}
