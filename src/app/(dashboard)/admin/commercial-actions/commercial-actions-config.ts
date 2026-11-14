import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { RelatedRecord } from '@/components/crud/related-records';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { formatCurrency, formatDate } from '@/lib/format';
import type { FilterDefinition } from '@/lib/list-filters';
import type { CommercialAction, CommercialActionRelation } from '@/types/commercial-action';

export const COMMERCIAL_ACTIONS_HREF = '/admin/commercial-actions';

type ActionFilterOptions = {
  event: ComboboxOption | null;
  wallet: ComboboxOption | null;
  responsible: ComboboxOption | null;
  canSearchEvents: boolean;
  canSearchWallets: boolean;
  canSearchEmployees: boolean;
};

export function getActionFilters({
  event,
  wallet,
  responsible,
  canSearchEvents,
  canSearchWallets,
  canSearchEmployees,
}: ActionFilterOptions): FilterDefinition[] {
  const filters: FilterDefinition[] = [];

  if (canSearchEvents) {
    filters.push({
      type: 'search',
      key: 'eventId',
      label: 'Tipo de evento',
      source: 'events',
      selected: event,
    });
  }

  if (canSearchEmployees) {
    filters.push({
      type: 'search',
      key: 'responsibleId',
      label: 'Responsável',
      source: 'employees',
      selected: responsible,
    });
  }

  if (canSearchWallets) {
    filters.push({
      type: 'search',
      key: 'walletId',
      label: 'Carteira',
      source: 'wallets',
      selected: wallet,
    });
  }

  filters.push({ type: 'dateRange', label: 'Início', fromKey: 'initialFrom', toKey: 'initialTo' });

  return filters;
}

export const ACTION_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma ação encontrada',
  filtersDescription: 'Nenhuma ação comercial corresponde aos filtros aplicados.',
  searchHint: 'Busque pela descrição ou pelo nome do tipo de evento.',
  emptyTitle: 'Nenhuma ação comercial cadastrada',
  emptyDescription: 'Cadastre a primeira ação comercial, como um dia de campo ou uma feira.',
  emptyReadOnlyDescription: 'Quando houver ações comerciais cadastradas, elas aparecerão aqui.',
};

const ACTION_DELETE_TEXTS: DeleteDialogTexts = {
  description: 'A ação comercial sai da lista da empresa. Não é possível desfazer.',
  confirmLabel: 'Excluir ação',
  successMessage: 'Ação comercial excluída.',
  errorMessage: 'Não foi possível excluir a ação comercial. Tente novamente.',
};

export function getActionTitle(action: Pick<CommercialAction, 'description' | 'event'>): string {
  return action.description || `Ação de ${action.event.name}`;
}

export function getActionDeleteTexts(
  action: Pick<CommercialAction, 'price' | 'wallet'>,
): DeleteDialogTexts {
  if (!action.price) {
    return ACTION_DELETE_TEXTS;
  }

  return {
    ...ACTION_DELETE_TEXTS,
    warning: `${formatCurrency(action.price)} voltam para a carteira de ${action.wallet.name}.`,
  };
}

export function formatPeriod({ initialDate, finalDate }: CommercialAction): string {
  if (initialDate && finalDate) {
    return `${formatDate(initialDate)} a ${formatDate(finalDate)}`;
  }

  return initialDate ? formatDate(initialDate) : finalDate ? `Até ${formatDate(finalDate)}` : '—';
}

export function formatGuestsCount({ producerGuests, resellerGuests }: CommercialAction): string {
  const count = producerGuests.length + resellerGuests.length;

  if (count === 0) {
    return 'Nenhum convidado';
  }

  return count === 1 ? '1 convidado' : `${count} convidados`;
}

export function formatNames(relations: CommercialActionRelation[]): string {
  return relations.map((relation) => relation.name).join(', ');
}

export function toActionRecords(actions: CommercialAction[]): RelatedRecord[] {
  return actions.map((action) => {
    const parts = [formatPeriod(action), `Responsável: ${action.responsible.name}`];

    return {
      id: action.id,
      href: `${COMMERCIAL_ACTIONS_HREF}/${action.id}`,
      title: getActionTitle(action),
      subtitle: parts.filter((part) => part !== '—').join(' · '),
      value: action.price ? formatCurrency(action.price) : undefined,
    };
  });
}
