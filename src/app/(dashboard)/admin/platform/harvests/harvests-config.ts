import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const HARVEST_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const HARVEST_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma cultura encontrada',
  filtersDescription: 'Nenhuma cultura corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia do nome.',
  emptyTitle: 'Nenhuma cultura cadastrada',
  emptyDescription: 'Cadastre as culturas, como milho e soja, para as empresas usarem nas visitas.',
  emptyReadOnlyDescription: 'Quando houver culturas cadastradas, elas aparecerão aqui.',
};

const HARVEST_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'A cultura sai da lista de todas as empresas e não poderá mais ser usada nas visitas. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir cultura',
  successMessage: 'Cultura excluída.',
  errorMessage: 'Não foi possível excluir a cultura. Tente novamente.',
};

export function formatTripsCount(tripsCount: number): string {
  if (tripsCount === 0) {
    return 'Nenhuma visita';
  }

  return tripsCount === 1 ? '1 visita' : `${tripsCount} visitas`;
}

export function getHarvestDeleteTexts(tripsCount: number): DeleteDialogTexts {
  if (tripsCount === 0) {
    return HARVEST_DELETE_TEXTS;
  }

  const warning =
    tripsCount === 1
      ? 'A cultura sai de 1 visita, que continua cadastrada.'
      : `A cultura sai de ${tripsCount} visitas, que continuam cadastradas.`;

  return { ...HARVEST_DELETE_TEXTS, warning };
}
