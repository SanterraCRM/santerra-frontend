import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const PLATFORM_USERS_HREF = '/admin/platform/users';

export const PLATFORM_USER_FILTERS: FilterDefinition[] = [
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

export const PLATFORM_USER_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum usuário encontrado',
  filtersDescription: 'Nenhum usuário corresponde aos filtros aplicados.',
  searchHint: 'Busque pelo nome ou pelo e-mail.',
  emptyTitle: 'Nenhum usuário cadastrado',
  emptyDescription: 'Cadastre o primeiro usuário da plataforma.',
  emptyReadOnlyDescription: 'Quando houver usuários cadastrados, eles aparecerão aqui.',
};
