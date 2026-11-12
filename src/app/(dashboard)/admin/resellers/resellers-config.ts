import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const RESELLER_FILTERS: FilterDefinition[] = [
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

export const RESELLER_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma revenda encontrada',
  filtersDescription: 'Nenhuma revenda corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque pelo CNPJ.',
  emptyTitle: 'Nenhuma revenda cadastrada',
  emptyDescription: 'Cadastre a primeira revenda para convidá-la para as ações comerciais.',
  emptyReadOnlyDescription: 'Quando houver revendas cadastradas, elas aparecerão aqui.',
};

const RESELLER_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'A revenda sai da lista e não poderá mais ser convidada para ações comerciais. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir revenda',
  successMessage: 'Revenda excluída.',
  errorMessage: 'Não foi possível excluir a revenda. Tente novamente.',
};

export function getResellerDeleteTexts(actionsCount: number): DeleteDialogTexts {
  if (actionsCount === 0) {
    return RESELLER_DELETE_TEXTS;
  }

  const warning =
    actionsCount === 1
      ? 'A revenda deixa de aparecer como convidada em 1 ação comercial, que continua cadastrada.'
      : `A revenda deixa de aparecer como convidada em ${actionsCount} ações comerciais, que continuam cadastradas.`;

  return { ...RESELLER_DELETE_TEXTS, warning };
}
