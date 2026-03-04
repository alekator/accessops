export const ROLES = ['Admin', 'Manager', 'Viewer'] as const;

export type Role = (typeof ROLES)[number];

export type Session = {
  email: string;
  name: string;
  role: Role;
};
