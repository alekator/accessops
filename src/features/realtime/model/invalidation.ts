import { type RealtimeEvent } from './events';

export function getInvalidationKeys(event: RealtimeEvent): Array<readonly unknown[]> {
  if (event.type === 'USER_UPDATED_BY_OTHER') {
    return [['users'], ['user', event.userId], ['audit']];
  }

  return [['roles'], ['audit']];
}
