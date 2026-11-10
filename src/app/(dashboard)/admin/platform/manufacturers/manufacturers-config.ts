import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const MANUFACTURER_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
  {
    type: 'checkboxes',
    key: 'missing',
    label: 'Dados faltando',
    options: [
      { value: 'registrationNumber', label: 'Sem CNPJ' },
      { value: 'phoneNumber', label: 'Sem telefone' },
      { value: 'email', label: 'Sem e-mail' },
    ],
  },
];

export const MANUFACTURER_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum fabricante encontrado',
  filtersDescription: 'Nenhum fabricante corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque pelo CNPJ.',
  emptyTitle: 'Nenhum fabricante cadastrado',
  emptyDescription: 'Cadastre o primeiro fabricante para as empresas poderem cadastrar produtos.',
  emptyReadOnlyDescription: 'Quando houver fabricantes cadastrados, eles aparecerão aqui.',
};

export const MANUFACTURER_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'O fabricante sai da lista de todas as empresas e não poderá mais ser usado em produtos. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir fabricante',
  successMessage: 'Fabricante excluído.',
  errorMessage: 'Não foi possível excluir o fabricante. Tente novamente.',
};
