import { PermissionPolicySchema } from '@/entities/role/model/schemas';
import { getRoleById, listRoles, updateRolePolicyById } from '@/mocks/db/roles-db';
import { http, HttpResponse } from 'msw';

export const rolesHandlers = [
  http.get('/api/roles', async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return HttpResponse.json({
      items: listRoles(),
    });
  }),
  http.patch('/api/roles/:id', async ({ params, request }) => {
    const id = String(params.id);
    const payload = (await request.json()) as { policy?: unknown };

    await new Promise((resolve) => setTimeout(resolve, 350));

    const shouldFail = Math.random() < 0.1 || request.headers.get('x-force-error') === '1';
    if (shouldFail) {
      return HttpResponse.json(
        {
          message: 'Failed to update role policy. Please retry.',
          code: 'WRITE_FAILED',
        },
        { status: 500 },
      );
    }

    if (!getRoleById(id)) {
      return HttpResponse.json(
        {
          message: 'Role not found',
          code: 'ROLE_NOT_FOUND',
        },
        { status: 404 },
      );
    }

    const parsed = PermissionPolicySchema.safeParse(payload.policy);
    if (!parsed.success) {
      return HttpResponse.json(
        {
          message: 'Invalid policy payload',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    const updated = updateRolePolicyById(id, parsed.data);
    return HttpResponse.json(updated);
  }),
];
