import { z } from 'zod';

import { PermissionPolicySchema, RoleSchema } from './schemas';

export const RolePolicyRevisionStatusSchema = z.enum([
  'proposed',
  'approved',
  'rejected',
  'rolled_back',
]);

export const RolePolicyRevisionSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  version: z.number().int().positive(),
  status: RolePolicyRevisionStatusSchema,
  policy: PermissionPolicySchema,
  createdAt: z.string(),
  createdBy: z.string(),
  note: z.string().nullable(),
  approvedAt: z.string().nullable(),
  approvedBy: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  rejectedBy: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  rollbackTargetRevisionId: z.string().nullable(),
});

export const RoleRevisionsResponseSchema = z.object({
  role: RoleSchema,
  activeRevisionId: z.string().nullable(),
  items: z.array(RolePolicyRevisionSchema),
});

export const RoleRevisionActionResponseSchema = z.object({
  role: RoleSchema,
  activeRevisionId: z.string().nullable(),
  revision: RolePolicyRevisionSchema,
});

export type RolePolicyRevisionStatus = z.infer<typeof RolePolicyRevisionStatusSchema>;
export type RolePolicyRevision = z.infer<typeof RolePolicyRevisionSchema>;
export type RoleRevisionsResponse = z.infer<typeof RoleRevisionsResponseSchema>;
export type RoleRevisionActionResponse = z.infer<typeof RoleRevisionActionResponseSchema>;
