import { getUserById, isEmailUnique, listUsers, updateUserById } from '@/mocks/db/users-db';
import { http, HttpResponse } from 'msw';

type SortBy = 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function compareValues(a: string, b: string, order: SortOrder) {
  const base = a.localeCompare(b);
  return order === 'asc' ? base : -base;
}

export const usersHandlers = [
  http.get('/api/users/check-email', async ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const excludeId = url.searchParams.get('excludeId') ?? undefined;

    if (!email) {
      return HttpResponse.json(
        {
          message: 'email is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 180));

    return HttpResponse.json({
      isUnique: isEmailUnique(email, excludeId),
    });
  }),
  http.get('/api/users', async ({ request }) => {
    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? 10) || 10);
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const sortBy = (url.searchParams.get('sortBy') as SortBy | null) ?? 'createdAt';
    const sortOrder = (url.searchParams.get('sortOrder') as SortOrder | null) ?? 'desc';

    let filtered = listUsers().filter((item) => {
      const statusOk = status ? item.status === status : true;
      const roleOk = role ? item.role === role : true;
      const searchOk = search
        ? item.name.toLowerCase().includes(search) || item.email.toLowerCase().includes(search)
        : true;
      return statusOk && roleOk && searchOk;
    });

    filtered = filtered.sort((left, right) => {
      const leftValue = left[sortBy];
      const rightValue = right[sortBy];
      return compareValues(String(leftValue), String(rightValue), sortOrder);
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    await new Promise((resolve) => setTimeout(resolve, 350));

    return HttpResponse.json({
      items,
      page: safePage,
      pageSize,
      total,
      totalPages,
    });
  }),
  http.get('/api/users/:id', async ({ params }) => {
    const id = String(params.id);
    const user = getUserById(id);

    await new Promise((resolve) => setTimeout(resolve, 180));

    if (!user) {
      return HttpResponse.json(
        {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(user);
  }),
  http.patch('/api/users/:id', async ({ params, request }) => {
    const id = String(params.id);
    const body = (await request.json()) as Partial<{
      name: string;
      email: string;
      role: 'Admin' | 'Manager' | 'Viewer';
      status: 'Active' | 'Suspended' | 'Invited';
      suspendReason?: string;
    }>;

    await new Promise((resolve) => setTimeout(resolve, 350));

    const shouldFail = Math.random() < 0.1 || request.headers.get('x-force-error') === '1';
    if (shouldFail) {
      return HttpResponse.json(
        {
          message: 'Failed to update user. Please retry.',
          code: 'WRITE_FAILED',
        },
        { status: 500 },
      );
    }

    if (body.email && !isEmailUnique(body.email, id)) {
      return HttpResponse.json(
        {
          message: 'Email is already taken',
          code: 'EMAIL_TAKEN',
        },
        { status: 409 },
      );
    }

    const updated = updateUserById(id, body);
    if (!updated) {
      return HttpResponse.json(
        {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(updated);
  }),
];
