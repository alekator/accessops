import { type PermissionAction, type PermissionModule, type PermissionPolicy } from '@/entities/role/model/schemas';

export const PERMISSION_MODULES: PermissionModule[] = ['Users', 'Billing', 'Documents', 'Reports'];
export const PERMISSION_ACTIONS: PermissionAction[] = ['Read', 'Write', 'Delete', 'Export', 'Admin'];

export function createEmptyPolicy(): PermissionPolicy {
  return {
    Users: { Read: false, Write: false, Delete: false, Export: false, Admin: false },
    Billing: { Read: false, Write: false, Delete: false, Export: false, Admin: false },
    Documents: { Read: false, Write: false, Delete: false, Export: false, Admin: false },
    Reports: { Read: false, Write: false, Delete: false, Export: false, Admin: false },
  };
}

function copyPolicy(policy: PermissionPolicy): PermissionPolicy {
  return {
    Users: { ...policy.Users },
    Billing: { ...policy.Billing },
    Documents: { ...policy.Documents },
    Reports: { ...policy.Reports },
  };
}

export function toggleCell(
  policy: PermissionPolicy,
  moduleName: PermissionModule,
  action: PermissionAction,
): PermissionPolicy {
  const next = copyPolicy(policy);
  next[moduleName][action] = !policy[moduleName][action];
  return next;
}

export function toggleRow(policy: PermissionPolicy, moduleName: PermissionModule): PermissionPolicy {
  const next = copyPolicy(policy);
  const shouldEnable = !PERMISSION_ACTIONS.every((action) => policy[moduleName][action]);
  PERMISSION_ACTIONS.forEach((action) => {
    next[moduleName][action] = shouldEnable;
  });
  return next;
}

export function toggleColumn(policy: PermissionPolicy, action: PermissionAction): PermissionPolicy {
  const next = copyPolicy(policy);
  const shouldEnable = !PERMISSION_MODULES.every((moduleName) => policy[moduleName][action]);
  PERMISSION_MODULES.forEach((moduleName) => {
    next[moduleName][action] = shouldEnable;
  });
  return next;
}

export function toggleAll(policy: PermissionPolicy): PermissionPolicy {
  const next = copyPolicy(policy);
  const shouldEnable = !PERMISSION_MODULES.every((moduleName) =>
    PERMISSION_ACTIONS.every((action) => policy[moduleName][action]),
  );
  PERMISSION_MODULES.forEach((moduleName) => {
    PERMISSION_ACTIONS.forEach((action) => {
      next[moduleName][action] = shouldEnable;
    });
  });
  return next;
}

export type PermissionDiffItem = {
  module: PermissionModule;
  action: PermissionAction;
  from: boolean;
  to: boolean;
};

export function getPolicyDiff(base: PermissionPolicy, draft: PermissionPolicy): PermissionDiffItem[] {
  const result: PermissionDiffItem[] = [];
  PERMISSION_MODULES.forEach((moduleName) => {
    PERMISSION_ACTIONS.forEach((action) => {
      const from = base[moduleName][action];
      const to = draft[moduleName][action];
      if (from !== to) {
        result.push({
          module: moduleName,
          action,
          from,
          to,
        });
      }
    });
  });
  return result;
}
