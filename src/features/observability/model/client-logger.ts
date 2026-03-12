type LogLevel = 'info' | 'warn' | 'error';
export type LogCategory =
  | 'auth'
  | 'permission'
  | 'validation'
  | 'network'
  | 'backend'
  | 'performance'
  | 'unknown';

type LogPayload = {
  id: string;
  event: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  context?: Record<string, unknown>;
};

const logs: LogPayload[] = [];
const listeners = new Set<() => void>();
const MAX_LOGS = 200;

function emit() {
  listeners.forEach((listener) => listener());
}

function nextLogId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function write(level: LogLevel, payload: LogPayload) {
  const message = `[accessops:${level}] ${payload.event}`;

  logs.unshift(payload);
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }
  emit();

  if (level === 'error') {
    console.error(message, payload);
    return;
  }
  if (level === 'warn') {
    console.warn(message, payload);
    return;
  }
  console.info(message, payload);
}

export function resolveLogCategoryFromError(error: unknown): LogCategory {
  const err = error as
    | {
        status?: unknown;
        code?: unknown;
        message?: unknown;
      }
    | undefined;

  const status = typeof err?.status === 'number' ? err.status : null;
  const code = typeof err?.code === 'string' ? err.code.toUpperCase() : '';
  const message = typeof err?.message === 'string' ? err.message.toLowerCase() : '';

  if (status === 401 || code.includes('AUTH')) {
    return 'auth';
  }
  if (status === 403 || code.includes('PERMISSION')) {
    return 'permission';
  }
  if (status === 400 || status === 422 || code.includes('VALIDATION')) {
    return 'validation';
  }
  if (
    status === 0 ||
    code.includes('NETWORK') ||
    message.includes('network') ||
    message.includes('failed to fetch')
  ) {
    return 'network';
  }
  if ((status !== null && status >= 500) || code.includes('SCHEMA_VALIDATION')) {
    return 'backend';
  }
  return 'unknown';
}

export function logInfo(
  event: string,
  context?: Record<string, unknown>,
  category: LogCategory = 'unknown',
) {
  write('info', payload(event, context, category, 'info'));
}

function payload(
  event: string,
  context: Record<string, unknown> | undefined,
  category: LogCategory,
  level: LogLevel,
): LogPayload {
  return {
    id: nextLogId(),
    level,
    event,
    timestamp: new Date().toISOString(),
    category,
    context,
  };
}

export function logWarn(
  event: string,
  context?: Record<string, unknown>,
  category: LogCategory = 'unknown',
) {
  write('warn', payload(event, context, category, 'warn'));
}

export function logError(
  event: string,
  context?: Record<string, unknown>,
  category: LogCategory = 'unknown',
) {
  write('error', payload(event, context, category, 'error'));
}

export function getRecentLogs(limit = 80) {
  return logs.slice(0, limit);
}

export function getLogsSnapshot() {
  return logs;
}

export function clearLogs() {
  logs.length = 0;
  emit();
}

export function subscribeToLogs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
