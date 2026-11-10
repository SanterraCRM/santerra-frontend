import type { Session } from 'next-auth';

import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { FormCheckboxOption } from '@/components/form/form-checkbox-group';
import type { PageTab } from '@/components/layout/page-tabs';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';
import { hasAllPermissions } from '@/lib/permissions';
import type { MemberDetails } from '@/types/member';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

const ROLE_OUT_OF_SCOPE_DESCRIPTION =
  'Tem permissões que você não tem, então você não pode atribuí-lo.';

const TEAM_TABS: PageTab[] = [
  { label: 'Membros', href: '/admin/members' },
  { label: 'Convites', href: '/admin/members/invitations' },
];

export function getTeamTabs(session: Session): PageTab[] | null {
  return session.permissions.includes('invitations.read') ? TEAM_TABS : null;
}

export function getRoleOptions(
  roles: Role[] | null,
  permissions: Permission[],
  grantedPermissions: string[],
): FormCheckboxOption[] | null {
  if (!roles) {
    return null;
  }

  return roles.map((role) => {
    const isGrantable = hasAllPermissions(role.permissionIds, permissions, grantedPermissions);

    return {
      value: role.id,
      label: role.name,
      description: isGrantable ? role.description : ROLE_OUT_OF_SCOPE_DESCRIPTION,
      disabled: !isGrantable,
    };
  });
}

export const MEMBER_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum membro encontrado',
  filtersDescription: 'Nenhum membro corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque pelo e-mail.',
  emptyTitle: 'Nenhum membro na equipe',
  emptyDescription: 'As pessoas entram na equipe pelos convites.',
  emptyReadOnlyDescription: 'Quando houver membros na equipe, eles aparecerão aqui.',
};

export function getMemberFilters(roles: Role[] | null): FilterDefinition[] {
  const filters: FilterDefinition[] = [
    {
      type: 'select',
      key: 'active',
      label: 'Situação',
      options: [
        { value: 'true', label: 'Ativos' },
        { value: 'false', label: 'Inativos' },
      ],
    },
  ];

  if (roles && roles.length > 0) {
    filters.push({
      type: 'select',
      key: 'roleId',
      label: 'Cargo',
      options: roles.map((role) => ({ value: role.id, label: role.name })),
    });
  }

  return filters;
}

export function getMemberRemoveTexts(name: string): DeleteDialogTexts {
  return {
    actionLabel: 'Remover da empresa',
    title: `Remover ${name} da empresa?`,
    description:
      'A pessoa perde o acesso à empresa na hora, e o funcionário ligado a ela continua cadastrado, sem o vínculo. Para voltar, ela precisa de um novo convite.',
    confirmLabel: 'Remover da empresa',
    successMessage: 'Membro removido da empresa.',
    errorMessage: 'Não foi possível remover o membro. Tente novamente.',
  };
}

export function getRoleNames(roleIds: string[], roles: Role[]): string[] {
  return roles.filter((role) => roleIds.includes(role.id)).map((role) => role.name);
}

export function getMemberReadOnlyReason(
  member: MemberDetails,
  session: Session,
  roles: Role[] | null,
  permissions: Permission[],
): string | null {
  if (member.isOwner) {
    return 'O dono da empresa não pode ser alterado nem removido.';
  }

  if (member.userId === session.user.id) {
    return 'Você não pode alterar o seu próprio acesso.';
  }

  const memberPermissionIds = (roles ?? [])
    .filter((role) => member.roleIds.includes(role.id))
    .flatMap((role) => role.permissionIds);

  if (!hasAllPermissions(memberPermissionIds, permissions, session.permissions)) {
    return 'Os cargos deste membro têm permissões que você não tem, então você só pode visualizá-lo.';
  }

  return null;
}
