import { z } from 'zod';

export const UserStatusSchema = z.enum(['Active', 'Suspended', 'Invited']);
export const UserRoleSchema = z.enum(['Admin', 'Manager', 'Viewer']);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  suspendReason: z.string().optional(),
  createdAt: z.string(),
});

export const UsersListResponseSchema = z.object({
  items: z.array(UserSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(1),
});

export type User = z.infer<typeof UserSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
