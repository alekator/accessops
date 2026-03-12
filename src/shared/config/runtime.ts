export type ApiMode = 'mock' | 'api';

const modeFromEnv = process.env.NEXT_PUBLIC_API_MODE;

export const API_MODE: ApiMode = modeFromEnv === 'api' ? 'api' : 'mock';

const baseUrlRaw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';
export const API_BASE_URL = baseUrlRaw.replace(/\/+$/, '');

export function isMockMode() {
  return API_MODE === 'mock';
}

export function isApiMode() {
  return API_MODE === 'api';
}
