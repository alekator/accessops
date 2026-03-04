import { UserRoleSchema, UserStatusSchema } from '@/entities/user/model/schemas';
import { z } from 'zod';

export const EditUserFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must contain at least 2 characters'),
    email: z.email('Provide a valid email'),
    role: UserRoleSchema,
    status: UserStatusSchema,
    suspendReason: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'Suspended' && !value.suspendReason) {
      ctx.addIssue({
        code: 'custom',
        path: ['suspendReason'],
        message: 'Suspend reason is required when status is Suspended',
      });
    }
  });

export type EditUserFormValues = z.infer<typeof EditUserFormSchema>;
