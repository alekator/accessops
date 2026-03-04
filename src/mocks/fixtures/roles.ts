import { type Role } from '@/entities/role/model/schemas';

function fullPolicy() {
  return {
    Users: { Read: true, Write: true, Delete: true, Export: true, Admin: true },
    Billing: { Read: true, Write: true, Delete: true, Export: true, Admin: true },
    Documents: { Read: true, Write: true, Delete: true, Export: true, Admin: true },
    Reports: { Read: true, Write: true, Delete: true, Export: true, Admin: true },
  };
}

function managerPolicy() {
  return {
    Users: { Read: true, Write: true, Delete: false, Export: true, Admin: false },
    Billing: { Read: true, Write: false, Delete: false, Export: true, Admin: false },
    Documents: { Read: true, Write: true, Delete: false, Export: true, Admin: false },
    Reports: { Read: true, Write: true, Delete: false, Export: true, Admin: false },
  };
}

function viewerPolicy() {
  return {
    Users: { Read: true, Write: false, Delete: false, Export: false, Admin: false },
    Billing: { Read: true, Write: false, Delete: false, Export: false, Admin: false },
    Documents: { Read: true, Write: false, Delete: false, Export: false, Admin: false },
    Reports: { Read: true, Write: false, Delete: false, Export: false, Admin: false },
  };
}

export function createRolesFixture(): Role[] {
  return [
    {
      id: 'role_admin',
      name: 'Admin',
      description: 'Full access across all modules.',
      policy: fullPolicy(),
    },
    {
      id: 'role_manager',
      name: 'Manager',
      description: 'Operational access with limited destructive permissions.',
      policy: managerPolicy(),
    },
    {
      id: 'role_viewer',
      name: 'Viewer',
      description: 'Read-only access for audit and reporting usage.',
      policy: viewerPolicy(),
    },
  ];
}
