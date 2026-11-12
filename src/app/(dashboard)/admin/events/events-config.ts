import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const EVENT_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const EVENT_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum evento encontrado',
  filtersDescription: 'Nenhum evento corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho da descrição.',
  emptyTitle: 'Nenhum evento cadastrado',
  emptyDescription: 'Cadastre o primeiro evento para registrar as ações comerciais feitas nele.',
  emptyReadOnlyDescription: 'Quando houver eventos cadastrados, eles aparecerão aqui.',
};

export const EVENT_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'O evento sai da lista e não poderá mais ser usado no cadastro de ações comerciais. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir evento',
  successMessage: 'Evento excluído.',
  errorMessage: 'Não foi possível excluir o evento. Tente novamente.',
};
