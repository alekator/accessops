import { isMockMode } from '@/shared/config/runtime';

let started = false;

export async function initMocks() {
  if (started) {
    return;
  }

  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  if (!isMockMode()) {
    return;
  }

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  started = true;
}
