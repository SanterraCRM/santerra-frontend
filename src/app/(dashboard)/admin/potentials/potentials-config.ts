import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const POTENTIAL_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const POTENTIAL_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum potencial encontrado',
  filtersDescription: 'Nenhum potencial corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho da descrição.',
  emptyTitle: 'Nenhum potencial cadastrado',
  emptyDescription: 'Cadastre o primeiro potencial para poder classificar os produtores.',
  emptyReadOnlyDescription: 'Quando houver potenciais cadastrados, eles aparecerão aqui.',
};

export const POTENTIAL_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'O potencial sai da lista e não poderá mais ser usado no cadastro de produtores. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir potencial',
  successMessage: 'Potencial excluído.',
  errorMessage: 'Não foi possível excluir o potencial. Tente novamente.',
};
