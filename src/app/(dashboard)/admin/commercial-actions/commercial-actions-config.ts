import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { RelatedRecord } from '@/components/crud/related-records';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { formatCurrency, formatDate } from '@/lib/format';
import type { FilterDefinition, FilterOption } from '@/lib/list-filters';
import type { CommercialAction, CommercialActionRelation } from '@/types/commercial-action';

export const COMMERCIAL_ACTIONS_HREF = '/admin/commercial-actions';

type ActionFilterOptions = {
  events: FilterOption[] | null;
  wallets: FilterOption[] | null;
  responsible: ComboboxOption | null;
  canSearchEmployees: boolean;
};

export function getActionFilters({
  events,
  wallets,
  responsible,
  canSearchEmployees,
}: ActionFilterOptions): FilterDefinition[] {
  const filters: FilterDefinition[] = [];

  if (events && events.length > 0) {
    filters.push({ type: 'select', key: 'eventId', label: 'Evento', options: events });
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

  if (wallets && wallets.length > 0) {
    filters.push({ type: 'select', key: 'walletId', label: 'Carteira', options: wallets });
  }

  filters.push({ type: 'dateRange', label: 'Início', fromKey: 'initialFrom', toKey: 'initialTo' });

  return filters;
}

export const ACTION_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma ação encontrada',
  filtersDescription: 'Nenhuma ação comercial corresponde aos filtros aplicados.',
  searchHint: 'Busque pela descrição ou pelo nome do evento.',
  emptyTitle: 'Nenhuma ação comercial cadastrada',
  emptyDescription: 'Cadastre a primeira ação comercial de um evento.',
  emptyReadOnlyDescription: 'Quando houver ações comerciais cadastradas, elas aparecerão aqui.',
};

const ACTION_DELETE_TEXTS: DeleteDialogTexts = {
  description: 'A ação comercial sai da lista da empresa. Não é possível desfazer.',
  confirmLabel: 'Excluir ação',
  successMessage: 'Ação comercial excluída.',
  errorMessage: 'Não foi possível excluir a ação comercial. Tente novamente.',
};

export function getActionTitle(action: Pick<CommercialAction, 'description' | 'event'>): string {
  return action.description || `Ação no evento ${action.event.name}`;
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

export function toActionRecords(
  actions: CommercialAction[],
  perspective: 'event' | 'wallet',
): RelatedRecord[] {
  return actions.map((action) => {
    const period = formatPeriod(action);
    const parts =
      perspective === 'event'
        ? [period, `Responsável: ${action.responsible.name}`]
        : [action.event.name, period];
    const price = action.price ? formatCurrency(action.price) : undefined;

    return {
      id: action.id,
      href: `${COMMERCIAL_ACTIONS_HREF}/${action.id}`,
      title: getActionTitle(action),
      subtitle: parts.filter((part) => part !== '—').join(' · '),
      value: price && perspective === 'wallet' ? `−${price}` : price,
    };
  });
}
