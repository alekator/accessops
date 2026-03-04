import { type AuditAction } from '@/entities/audit/model/schemas';
import { createAuditFixture } from '@/mocks/fixtures/audit';

const auditDb = createAuditFixture(500);

type AuditQuery = {
  cursor: string | null;
  userId?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
  limit?: number;
};

export function queryAuditEvents(query: AuditQuery) {
  const limit = query.limit ?? 30;
  const fromDate = query.from ? new Date(query.from).getTime() : null;
  const toDate = query.to ? new Date(query.to).getTime() : null;

  let filtered = auditDb.filter((item) => {
    const ts = new Date(item.timestamp).getTime();
    const userOk = query.userId ? item.userId.includes(query.userId) : true;
    const actionOk = query.action ? item.action === query.action : true;
    const fromOk = fromDate ? ts >= fromDate : true;
    const toOk = toDate ? ts <= toDate : true;
    return userOk && actionOk && fromOk && toOk;
  });

  if (query.cursor) {
    const index = filtered.findIndex((item) => item.id === query.cursor);
    if (index >= 0) {
      filtered = filtered.slice(index + 1);
    }
  }

  const items = filtered.slice(0, limit);
  const nextCursor = filtered.length > limit ? items[items.length - 1]?.id ?? null : null;

  return {
    items,
    nextCursor,
  };
}
