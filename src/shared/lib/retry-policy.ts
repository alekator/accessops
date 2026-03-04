const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (!error || typeof error !== 'object') {
    return true;
  }

  const maybeStatus = (error as { status?: unknown }).status;
  if (typeof maybeStatus === 'number') {
    return RETRYABLE_STATUSES.has(maybeStatus);
  }

  return true;
}
