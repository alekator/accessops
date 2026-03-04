import { z } from 'zod';

export const AuditActionSchema = z.enum([
  'USER_CREATED',
  'USER_UPDATED',
  'USER_SUSPENDED',
  'ROLE_UPDATED',
  'LOGIN',
]);

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  userId: z.string(),
  action: AuditActionSchema,
  message: z.string(),
  details: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export const AuditPageResponseSchema = z.object({
  items: z.array(AuditEventSchema),
  nextCursor: z.string().nullable(),
});

export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditPageResponse = z.infer<typeof AuditPageResponseSchema>;
