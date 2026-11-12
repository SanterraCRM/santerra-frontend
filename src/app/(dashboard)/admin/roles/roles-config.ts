import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const ROLE_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const ROLE_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum cargo encontrado',
  filtersDescription: 'Nenhum cargo corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho da descrição.',
  emptyTitle: 'Nenhum cargo cadastrado',
  emptyDescription: 'Crie cargos para definir o que cada pessoa da equipe pode fazer.',
  emptyReadOnlyDescription: 'Quando houver cargos cadastrados, eles aparecerão aqui.',
};

export const ROLE_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'O cargo sai da lista e não poderá mais ser atribuído à equipe. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir cargo',
  successMessage: 'Cargo excluído.',
  errorMessage: 'Não foi possível excluir o cargo. Tente novamente.',
};

export const OUT_OF_SCOPE_DESCRIPTION =
  'Este cargo tem permissões que você não tem, então você só pode visualizá-lo. Só quem tem todas elas pode editá-lo ou excluí-lo.';
