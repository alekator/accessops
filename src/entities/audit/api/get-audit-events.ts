import { AuditPageResponseSchema, type AuditAction } from '@/entities/audit/model/schemas';
import { apiRequest } from '@/shared/api/client';

export type AuditFilters = {
  userId: string;
  action: AuditAction | 'All';
  from: string;
  to: string;
};

export async function getAuditEvents(cursor: string | null, filters: AuditFilters) {
  return apiRequest('/api/audit', AuditPageResponseSchema, {
    query: {
      cursor: cursor ?? undefined,
      userId: filters.userId || undefined,
      action: filters.action === 'All' ? undefined : filters.action,
      from: filters.from || undefined,
      to: filters.to || undefined,
    },
  });
}
