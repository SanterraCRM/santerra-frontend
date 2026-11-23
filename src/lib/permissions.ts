import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

const ROLE_OUT_OF_SCOPE_DESCRIPTION =
  'Tem permissões que você não tem, então você não pode atribuí-lo.';

export type RoleOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  read: 'Ver',
  create: 'Criar',
  update: 'Editar',
  delete: 'Excluir',
};

export type PermissionExtraAction = {
  action: string;
  label: string;
  description: string;
};

export const PERMISSION_EXTRA_ACTIONS: Record<string, PermissionExtraAction[]> = {
  wallets: [
    {
      action: 'adjust',
      label: 'Ajustar saldo',
      description: 'Acrescentar ou diminuir o saldo, com motivo.',
    },
  ],
};

export type PermissionResource = {
  key: string;
  label: string;
};

export type PermissionResourceGroup = {
  label: string;
  resources: PermissionResource[];
};

export const PERMISSION_RESOURCE_GROUPS: PermissionResourceGroup[] = [
  {
    label: 'Entidades',
    resources: [
      { key: 'persons', label: 'Pessoas' },
      { key: 'employees', label: 'Funcionários' },
      { key: 'producers', label: 'Produtores' },
      { key: 'resellers', label: 'Revendas' },
    ],
  },
  {
    label: 'Comercial',
    resources: [
      { key: 'commercial-trips', label: 'Visitas' },
      { key: 'commercial-actions', label: 'Ações comerciais' },
      { key: 'events', label: 'Tipos de evento' },
      { key: 'wallets', label: 'Carteiras' },
      { key: 'goals', label: 'Metas' },
    ],
  },
  {
    label: 'Catálogo',
    resources: [
      { key: 'products', label: 'Produtos' },
      { key: 'groups', label: 'Grupos de produtos' },
    ],
  },
  {
    label: 'Configurações',
    resources: [
      { key: 'potentials', label: 'Potenciais' },
      { key: 'members', label: 'Equipe' },
      { key: 'invitations', label: 'Convites' },
      { key: 'roles', label: 'Cargos' },
      { key: 'company', label: 'Empresa' },
    ],
  },
  {
    label: 'Outros',
    resources: [{ key: 'files', label: 'Arquivos e anexos' }],
  },
];

export function getPermissionNames(permissionIds: string[], permissions: Permission[]): string[] {
  const ids = new Set(permissionIds);

  return permissions.filter((permission) => ids.has(permission.id)).map(({ name }) => name);
}

export function hasAllPermissions(
  permissionIds: string[],
  permissions: Permission[],
  grantedPermissions: string[],
): boolean {
  return getPermissionNames(permissionIds, permissions).every((name) =>
    grantedPermissions.includes(name),
  );
}

export function getRoleOptions(
  roles: Role[] | null,
  permissions: Permission[],
  grantedPermissions: string[],
): RoleOption[] | null {
  if (!roles) {
    return null;
  }

  return roles.map((role) => {
    const isGrantable = hasAllPermissions(role.permissionIds, permissions, grantedPermissions);

    return {
      value: role.id,
      label: role.name,
      description: isGrantable ? (role.description ?? undefined) : ROLE_OUT_OF_SCOPE_DESCRIPTION,
      disabled: !isGrantable,
    };
  });
}

export type AttachmentPermissions = {
  canUpload: boolean;
  canRemove: boolean;
};

export function getAttachmentPermissions(permissions: string[]): AttachmentPermissions | null {
  if (!permissions.includes('files.read')) {
    return null;
  }

  return {
    canUpload: permissions.includes('files.create'),
    canRemove: permissions.includes('files.delete'),
  };
}

export function formatPermissionsCount(count: number): string {
  if (count === 0) {
    return 'Nenhuma permissão';
  }

  return count === 1 ? '1 permissão' : `${count} permissões`;
}
