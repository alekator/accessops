import { auditHandlers } from './audit';
import { rolesHandlers } from './roles';
import { usersHandlers } from './users';

export const handlers = [...usersHandlers, ...rolesHandlers, ...auditHandlers];
