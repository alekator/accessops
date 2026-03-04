import { z } from 'zod';

const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiRequest<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: RequestOptions,
): Promise<z.infer<TSchema>> {
  const response = await fetch(buildUrl(path, options?.query), {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = ApiErrorSchema.safeParse(payload);
    const message = parsedError.success ? parsedError.data.message : `Request failed with status ${response.status}`;
    const code = parsedError.success ? parsedError.data.code : undefined;
    throw new ApiError(message, response.status, code);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError('Invalid API response shape', 500, 'SCHEMA_VALIDATION_FAILED');
  }

  return parsed.data;
}
