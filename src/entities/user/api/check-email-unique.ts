import { apiRequest } from '@/shared/api/client';
import { z } from 'zod';

const CheckEmailResponseSchema = z.object({
  isUnique: z.boolean(),
});

export async function checkEmailUnique(email: string, excludeId?: string) {
  return apiRequest('/api/users/check-email', CheckEmailResponseSchema, {
    query: {
      email,
      excludeId: excludeId || undefined,
    },
  });
}
