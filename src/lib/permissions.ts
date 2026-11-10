import type { Permission } from '@/types/permission';

export const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  read: 'Ver',
  create: 'Criar',
  update: 'Editar',
  delete: 'Excluir',
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
      { key: 'events', label: 'Eventos' },
      { key: 'wallets', label: 'Carteiras' },
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
