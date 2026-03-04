import { z } from 'zod';

export const PermissionModuleSchema = z.enum(['Users', 'Billing', 'Documents', 'Reports']);
export const PermissionActionSchema = z.enum(['Read', 'Write', 'Delete', 'Export', 'Admin']);

export const PermissionPolicySchema = z.record(
  PermissionModuleSchema,
  z.record(PermissionActionSchema, z.boolean()),
);

export const RoleSchema = z.object({
  id: z.string(),
  name: z.enum(['Admin', 'Manager', 'Viewer']),
  description: z.string(),
  policy: PermissionPolicySchema,
});

export const RolesListResponseSchema = z.object({
  items: z.array(RoleSchema),
});

export type PermissionModule = z.infer<typeof PermissionModuleSchema>;
export type PermissionAction = z.infer<typeof PermissionActionSchema>;
export type PermissionPolicy = z.infer<typeof PermissionPolicySchema>;
export type Role = z.infer<typeof RoleSchema>;
export type RolesListResponse = z.infer<typeof RolesListResponseSchema>;
