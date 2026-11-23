import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import { formatCurrency } from '@/lib/format';
import type { FilterDefinition, FilterOption } from '@/lib/list-filters';
import type { Wallet, WalletMovement, WalletMovementType } from '@/types/wallet';

import {
  COMMERCIAL_ACTIONS_HREF,
  getActionTitle,
} from '../commercial-actions/commercial-actions-config';

export const WALLETS_HREF = '/admin/wallets';

export const WALLET_FILTERS: FilterDefinition[] = [
  {
    type: 'select',
    key: 'balance',
    label: 'Saldo',
    options: [
      { value: 'positive', label: 'Com saldo' },
      { value: 'empty', label: 'Zerada' },
    ],
  },
];

export const WALLET_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma carteira encontrada',
  filtersDescription: 'Nenhuma carteira corresponde aos filtros aplicados.',
  searchHint: 'Busque pelo nome ou pelo e-mail do membro.',
  emptyTitle: 'Nenhuma carteira cadastrada',
  emptyDescription: 'Crie a carteira de um membro para ele usar nas ações comerciais.',
  emptyReadOnlyDescription: 'Quando houver carteiras cadastradas, elas aparecerão aqui.',
};

const WALLET_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'A carteira sai da lista e não poderá mais ser usada em ações comerciais. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir carteira',
  successMessage: 'Carteira excluída.',
  errorMessage: 'Não foi possível excluir a carteira. Tente novamente.',
};

export function getWalletTitle(wallet: Pick<Wallet, 'member'>): string {
  return `Carteira de ${wallet.member.name}`;
}

export function getWalletRecordName(wallet: Pick<Wallet, 'member'>): string {
  return `a carteira de ${wallet.member.name}`;
}

export function getWalletDeleteTexts(wallet: Pick<Wallet, 'value'>): DeleteDialogTexts {
  if (wallet.value <= 0) {
    return WALLET_DELETE_TEXTS;
  }

  return {
    ...WALLET_DELETE_TEXTS,
    warning: `A carteira ainda tem ${formatCurrency(wallet.value)} de saldo, que deixa de existir.`,
  };
}

export const WALLET_MOVEMENT_TYPE_LABELS: Record<WalletMovementType, string> = {
  INITIAL_BALANCE: 'Saldo inicial',
  ADJUSTMENT: 'Ajuste de saldo',
  ACTION_DEBIT: 'Débito de ação',
  ACTION_REFUND: 'Estorno de ação',
};

export const WALLET_MOVEMENT_FILTERS: FilterDefinition[] = [
  {
    type: 'select',
    key: 'type',
    label: 'Tipo',
    options: Object.entries(WALLET_MOVEMENT_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  { type: 'dateRange', label: 'Data', fromKey: 'createdFrom', toKey: 'createdTo' },
];

export const WALLET_MOVEMENT_DIRECTIONS: FilterOption[] = [
  { value: 'credit', label: 'Entradas' },
  { value: 'debit', label: 'Saídas' },
];

export const WALLET_MOVEMENT_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma movimentação encontrada',
  filtersDescription: 'Nenhuma movimentação corresponde aos filtros aplicados.',
  emptyTitle: 'Nenhuma movimentação ainda',
  emptyDescription:
    'Os acréscimos, os descontos e os débitos das ações comerciais vão aparecer aqui.',
  emptyReadOnlyDescription:
    'Os acréscimos, os descontos e os débitos das ações comerciais vão aparecer aqui.',
};

const movementDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

export function formatMovementDate(value: string): string {
  return movementDateFormatter.format(new Date(value));
}

export function formatSignedCurrency(value: number): string {
  return value < 0 ? `−${formatCurrency(Math.abs(value))}` : `+${formatCurrency(value)}`;
}

export function getMovementTitle(movement: WalletMovement): string {
  if (movement.commercialAction) {
    return getActionTitle(movement.commercialAction);
  }

  if (movement.type === 'ADJUSTMENT') {
    return movement.amount < 0 ? 'Desconto' : 'Acréscimo';
  }

  return movement.type === 'INITIAL_BALANCE' ? 'Saldo inicial' : 'Ação comercial';
}

export function getMovementSubtitle(movement: WalletMovement): string {
  const { commercialAction } = movement;

  if (commercialAction) {
    const parts = [WALLET_MOVEMENT_TYPE_LABELS[movement.type], commercialAction.event.name];

    return [...parts, ...(commercialAction.deletedAt ? ['ação excluída'] : [])].join(' · ');
  }

  if (movement.reason) {
    return movement.reason;
  }

  return movement.type === 'INITIAL_BALANCE'
    ? 'Saldo com que a carteira foi criada.'
    : WALLET_MOVEMENT_TYPE_LABELS[movement.type];
}

export function getMovementHref(movement: WalletMovement): string | undefined {
  const { commercialAction } = movement;

  return commercialAction && !commercialAction.deletedAt
    ? `${COMMERCIAL_ACTIONS_HREF}/${commercialAction.id}`
    : undefined;
}
