import { AuditActionSchema } from '@/entities/audit/model/schemas';
import { queryAuditEvents } from '@/mocks/db/audit-db';
import { http, HttpResponse } from 'msw';

export const auditHandlers = [
  http.get('/api/v1/audit', async ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const userId = url.searchParams.get('userId') ?? undefined;
    const actionRaw = url.searchParams.get('action');
    const from = url.searchParams.get('from') ?? undefined;
    const to = url.searchParams.get('to') ?? undefined;

    const parsedAction = AuditActionSchema.safeParse(actionRaw);

    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json(
      queryAuditEvents({
        cursor,
        userId,
        action: parsedAction.success ? parsedAction.data : undefined,
        from,
        to,
      }),
    );
  }),
];
