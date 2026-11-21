import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const EVENT_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const EVENT_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum tipo de evento encontrado',
  filtersDescription: 'Nenhum tipo de evento corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho da descrição.',
  emptyTitle: 'Nenhum tipo de evento cadastrado',
  emptyDescription:
    'Cadastre o primeiro tipo de evento, como dia de campo ou feira, para registrar as ações comerciais.',
  emptyReadOnlyDescription: 'Quando houver tipos de evento cadastrados, eles aparecerão aqui.',
};

export const EVENT_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'O tipo de evento sai da lista e não poderá mais ser usado no cadastro de ações comerciais. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir tipo de evento',
  successMessage: 'Tipo de evento excluído.',
  errorMessage: 'Não foi possível excluir o tipo de evento. Tente novamente.',
};
