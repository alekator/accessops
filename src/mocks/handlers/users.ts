import { createUsersFixture } from '@/mocks/fixtures/users';
import { http, HttpResponse } from 'msw';

const usersDb = createUsersFixture(200);

type SortBy = 'name' | 'email' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function compareValues(a: string, b: string, order: SortOrder) {
  const base = a.localeCompare(b);
  return order === 'asc' ? base : -base;
}

export const usersHandlers = [
  http.get('/api/users', async ({ request }) => {
    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? 10) || 10);
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role');
    const sortBy = (url.searchParams.get('sortBy') as SortBy | null) ?? 'createdAt';
    const sortOrder = (url.searchParams.get('sortOrder') as SortOrder | null) ?? 'desc';

    let filtered = usersDb.filter((item) => {
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
];
