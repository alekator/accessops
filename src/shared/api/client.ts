import { z } from 'zod';
import { logError } from '@/features/observability/model/client-logger';
import { API_BASE_URL } from '@/shared/config/runtime';

export const API_BASE_PATH = '/api/v1';

const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public correlationId?: string;

  constructor(message: string, status: number, code?: string, correlationId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

function getApiOrigin() {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }
  return typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin;
}

function applyQuery(url: URL, query?: RequestOptions['query']) {
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
}

export function buildApiUrl(path: string, query?: RequestOptions['query']) {
  if (isAbsoluteUrl(path)) {
    const absoluteUrl = new URL(path);
    applyQuery(absoluteUrl, query);
    return absoluteUrl.toString();
  }

  const normalizedPath = normalizeApiPath(path);
  const url = new URL(normalizedPath, getApiOrigin());
  applyQuery(url, query);
  return url.toString();
}

export function normalizeApiPath(path: string): string {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  if (path.startsWith(`${API_BASE_PATH}/`) || path === API_BASE_PATH) {
    return path;
  }

  if (path.startsWith('/api/')) {
    return path.replace('/api/', `${API_BASE_PATH}/`);
  }

  if (path.startsWith('/')) {
    return `${API_BASE_PATH}${path}`;
  }

  return `${API_BASE_PATH}/${path}`;
}

function createCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function resolveApiErrorCategory(status: number, code?: string) {
  const normalizedCode = code?.toUpperCase() ?? '';

  if (status === 401 || normalizedCode.includes('AUTH')) {
    return 'auth' as const;
  }
  if (status === 403 || normalizedCode.includes('PERMISSION')) {
    return 'permission' as const;
  }
  if (status === 400 || status === 422 || normalizedCode.includes('VALIDATION')) {
    return 'validation' as const;
  }
  if (status === 0 || normalizedCode.includes('NETWORK')) {
    return 'network' as const;
  }
  if (status >= 500 || normalizedCode.includes('SCHEMA_VALIDATION')) {
    return 'backend' as const;
  }
  return 'unknown' as const;
}

export async function apiRequest<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: RequestOptions,
): Promise<z.infer<TSchema>> {
  const correlationId = createCorrelationId();
  const url = buildApiUrl(path, options?.query);
  const method = options?.method ?? 'GET';
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    const networkError = new ApiError('Network request failed', 0, 'NETWORK_ERROR', correlationId);
    logError(
      'api_request_network_error',
      {
        path,
        method,
        correlationId,
      },
      'network',
    );
    throw networkError;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = ApiErrorSchema.safeParse(payload);
    const message = parsedError.success
      ? parsedError.data.message
      : `Request failed with status ${response.status}`;
    const code = parsedError.success ? parsedError.data.code : undefined;
    const apiError = new ApiError(message, response.status, code, correlationId);
    logError(
      'api_request_failed',
      {
        path,
        method,
        status: response.status,
        code,
        correlationId,
      },
      resolveApiErrorCategory(response.status, code),
    );
    throw apiError;
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    logError(
      'api_response_schema_invalid',
      {
        path,
        method,
        correlationId,
      },
      'backend',
    );
    throw new ApiError(
      'Invalid API response shape',
      500,
      'SCHEMA_VALIDATION_FAILED',
      correlationId,
    );
  }

  return parsed.data;
}
