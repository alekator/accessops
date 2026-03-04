import { describe, expect, it } from 'vitest';

import { shouldRetryQuery } from './retry-policy';

describe('shouldRetryQuery', () => {
  it('retries transient GET failures', () => {
    expect(shouldRetryQuery(0, { status: 503 })).toBe(true);
  });

  it('does not retry non-retryable http statuses', () => {
    expect(shouldRetryQuery(0, { status: 400 })).toBe(false);
  });

  it('stops retrying after max attempts', () => {
    expect(shouldRetryQuery(2, { status: 503 })).toBe(false);
  });
});
