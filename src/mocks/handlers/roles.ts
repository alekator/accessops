import { PermissionPolicySchema } from '@/entities/role/model/schemas';
import {
  approveRoleRevisionById,
  getRoleById,
  listRoleRevisions,
  listRoles,
  proposeRoleRevisionById,
  rejectRoleRevisionById,
  rollbackRolePolicyByRevisionId,
  updateRolePolicyById,
} from '@/mocks/db/roles-db';
import { http, HttpResponse } from 'msw';

export const rolesHandlers = [
  http.get('/api/v1/roles', async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return HttpResponse.json({
      items: listRoles(),
    });
  }),
  http.patch('/api/v1/roles/:id', async ({ params, request }) => {
    const id = String(params.id);
    const payload = (await request.json()) as { policy?: unknown };

    await new Promise((resolve) => setTimeout(resolve, 350));

    const isAutomation = typeof navigator !== 'undefined' && navigator.webdriver;
    const shouldFail =
      (!isAutomation && Math.random() < 0.1) || request.headers.get('x-force-error') === '1';
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
  http.get('/api/v1/roles/:id/revisions', async ({ params }) => {
    const id = String(params.id);
    await new Promise((resolve) => setTimeout(resolve, 250));

    const role = getRoleById(id);
    const revisions = listRoleRevisions(id);
    if (!role || !revisions) {
      return HttpResponse.json(
        {
          message: 'Role not found',
          code: 'ROLE_NOT_FOUND',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      role,
      activeRevisionId: revisions.activeRevisionId,
      items: revisions.items,
    });
  }),
  http.post('/api/v1/roles/:id/revisions', async ({ params, request }) => {
    const id = String(params.id);
    const payload = (await request.json()) as {
      policy?: unknown;
      actorId?: unknown;
      note?: unknown;
    };
    await new Promise((resolve) => setTimeout(resolve, 300));

    const parsedPolicy = PermissionPolicySchema.safeParse(payload.policy);
    if (!parsedPolicy.success) {
      return HttpResponse.json(
        {
          message: 'Invalid policy payload',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    if (typeof payload.actorId !== 'string' || payload.actorId.trim().length === 0) {
      return HttpResponse.json(
        {
          message: 'actorId is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    const result = proposeRoleRevisionById({
      roleId: id,
      policy: parsedPolicy.data,
      actorId: payload.actorId,
      note: typeof payload.note === 'string' ? payload.note : undefined,
    });

    if (!result) {
      return HttpResponse.json(
        {
          message: 'Role not found',
          code: 'ROLE_NOT_FOUND',
        },
        { status: 404 },
      );
    }

    if ('error' in result) {
      return HttpResponse.json(
        {
          message: 'An open proposed revision already exists for this role',
          code: result.error,
        },
        { status: 409 },
      );
    }

    return HttpResponse.json(result);
  }),
  http.post('/api/v1/roles/:id/revisions/:revisionId/approve', async ({ params, request }) => {
    const id = String(params.id);
    const revisionId = String(params.revisionId);
    const payload = (await request.json()) as { actorId?: unknown };
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (typeof payload.actorId !== 'string' || payload.actorId.trim().length === 0) {
      return HttpResponse.json(
        {
          message: 'actorId is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    const result = approveRoleRevisionById({ roleId: id, revisionId, actorId: payload.actorId });
    if (!result) {
      return HttpResponse.json(
        {
          message: 'Role not found',
          code: 'ROLE_NOT_FOUND',
        },
        { status: 404 },
      );
    }
    if ('error' in result) {
      return HttpResponse.json(
        {
          message: 'Revision cannot be approved in current state',
          code: result.error,
        },
        { status: 409 },
      );
    }
    return HttpResponse.json(result);
  }),
  http.post('/api/v1/roles/:id/revisions/:revisionId/reject', async ({ params, request }) => {
    const id = String(params.id);
    const revisionId = String(params.revisionId);
    const payload = (await request.json()) as { actorId?: unknown; reason?: unknown };
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (typeof payload.actorId !== 'string' || payload.actorId.trim().length === 0) {
      return HttpResponse.json(
        {
          message: 'actorId is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    const result = rejectRoleRevisionById({
      roleId: id,
      revisionId,
      actorId: payload.actorId,
      reason: typeof payload.reason === 'string' ? payload.reason : undefined,
    });
    if (!result) {
      return HttpResponse.json(
        {
          message: 'Role not found',
          code: 'ROLE_NOT_FOUND',
        },
        { status: 404 },
      );
    }
    if ('error' in result) {
      return HttpResponse.json(
        {
          message: 'Revision cannot be rejected in current state',
          code: result.error,
        },
        { status: 409 },
      );
    }
    return HttpResponse.json(result);
  }),
  http.post('/api/v1/roles/:id/revisions/:revisionId/rollback', async ({ params, request }) => {
    const id = String(params.id);
    const revisionId = String(params.revisionId);
    const payload = (await request.json()) as { actorId?: unknown };
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (typeof payload.actorId !== 'string' || payload.actorId.trim().length === 0) {
      return HttpResponse.json(
        {
          message: 'actorId is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    const result = rollbackRolePolicyByRevisionId({
      roleId: id,
      targetRevisionId: revisionId,
      actorId: payload.actorId,
    });
    if (!result) {
      return HttpResponse.json(
        {
          message: 'Role not found',
          code: 'ROLE_NOT_FOUND',
        },
        { status: 404 },
      );
    }
    if ('error' in result) {
      return HttpResponse.json(
        {
          message: 'Invalid rollback target revision',
          code: result.error,
        },
        { status: 409 },
      );
    }
    return HttpResponse.json(result);
  }),
];
