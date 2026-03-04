export type RealtimeEvent =
  | {
      type: 'USER_UPDATED_BY_OTHER';
      userId: string;
      message: string;
    }
  | {
      type: 'ROLE_POLICY_CHANGED';
      roleId: string;
      message: string;
    };

const DEMO_USER_IDS = ['usr_001', 'usr_014', 'usr_077', 'usr_143', 'usr_200'];
const DEMO_ROLE_IDS = ['role_admin', 'role_manager', 'role_viewer'];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createRandomRealtimeEvent(): RealtimeEvent {
  if (Math.random() < 0.6) {
    const userId = pickRandom(DEMO_USER_IDS);
    return {
      type: 'USER_UPDATED_BY_OTHER',
      userId,
      message: `User ${userId} was updated by another operator`,
    };
  }

  const roleId = pickRandom(DEMO_ROLE_IDS);
  return {
    type: 'ROLE_POLICY_CHANGED',
    roleId,
    message: `Role policy for ${roleId} has changed`,
  };
}
