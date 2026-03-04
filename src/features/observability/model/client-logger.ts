type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = {
  event: string;
  timestamp: string;
  context?: Record<string, unknown>;
};

function write(level: LogLevel, payload: LogPayload) {
  const message = `[accessops:${level}] ${payload.event}`;
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

export function logInfo(event: string, context?: Record<string, unknown>) {
  write('info', {
    event,
    timestamp: new Date().toISOString(),
    context,
  });
}

export function logWarn(event: string, context?: Record<string, unknown>) {
  write('warn', {
    event,
    timestamp: new Date().toISOString(),
    context,
  });
}

export function logError(event: string, context?: Record<string, unknown>) {
  write('error', {
    event,
    timestamp: new Date().toISOString(),
    context,
  });
}
