import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const GROUP_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const GROUP_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum grupo encontrado',
  filtersDescription: 'Nenhum grupo corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho da descrição.',
  emptyTitle: 'Nenhum grupo cadastrado',
  emptyDescription: 'Cadastre o primeiro grupo para organizar os produtos do catálogo.',
  emptyReadOnlyDescription: 'Quando houver grupos cadastrados, eles aparecerão aqui.',
};

const GROUP_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'O grupo sai da lista e não poderá mais ser usado no cadastro de produtos. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir grupo',
  successMessage: 'Grupo excluído.',
  errorMessage: 'Não foi possível excluir o grupo. Tente novamente.',
};

export function formatProductsCount(productsCount: number): string {
  if (productsCount === 0) {
    return 'Nenhum produto';
  }

  return productsCount === 1 ? '1 produto' : `${productsCount} produtos`;
}

export function getGroupDeleteTexts(productsCount: number): DeleteDialogTexts {
  if (productsCount === 0) {
    return GROUP_DELETE_TEXTS;
  }

  const warning =
    productsCount === 1
      ? '1 produto deixa de estar neste grupo, mas continua cadastrado.'
      : `${productsCount} produtos deixam de estar neste grupo, mas continuam cadastrados.`;

  return { ...GROUP_DELETE_TEXTS, warning };
}
