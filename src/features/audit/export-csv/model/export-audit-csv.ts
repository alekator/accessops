import { type AuditEvent } from '@/entities/audit/model/schemas';

function escapeCell(value: unknown): string {
  const text = String(value ?? '');
  const escaped = text.replaceAll('"', '""');
  return `"${escaped}"`;
}

export function buildAuditCsv(events: AuditEvent[]): string {
  const header = ['id', 'timestamp', 'userId', 'action', 'message', 'details'];
  const rows = events.map((event) => [
    event.id,
    event.timestamp,
    event.userId,
    event.action,
    event.message,
    JSON.stringify(event.details),
  ]);
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
}

export function downloadAuditCsv(events: AuditEvent[], filename = 'audit-log.csv') {
  const csv = buildAuditCsv(events);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
