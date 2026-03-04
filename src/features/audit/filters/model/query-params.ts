import { type AuditFilters } from '@/entities/audit/api/get-audit-events';
import { AuditActionSchema } from '@/entities/audit/model/schemas';

export const DEFAULT_AUDIT_FILTERS: AuditFilters = {
  userId: '',
  action: 'All',
  from: '',
  to: '',
};

type QueryLike = { get: (name: string) => string | null };

export function parseAuditFilters(input: QueryLike): AuditFilters {
  const actionRaw = input.get('action');
  const action =
    actionRaw === 'All' || AuditActionSchema.safeParse(actionRaw).success
      ? (actionRaw as AuditFilters['action'] | null)
      : null;

  return {
    userId: input.get('userId') ?? DEFAULT_AUDIT_FILTERS.userId,
    action: action ?? DEFAULT_AUDIT_FILTERS.action,
    from: input.get('from') ?? DEFAULT_AUDIT_FILTERS.from,
    to: input.get('to') ?? DEFAULT_AUDIT_FILTERS.to,
  };
}

export function toAuditQueryString(filters: AuditFilters): string {
  const params = new URLSearchParams();
  if (filters.userId) {
    params.set('userId', filters.userId);
  }
  if (filters.action !== 'All') {
    params.set('action', filters.action);
  }
  if (filters.from) {
    params.set('from', filters.from);
  }
  if (filters.to) {
    params.set('to', filters.to);
  }
  return params.toString();
}
