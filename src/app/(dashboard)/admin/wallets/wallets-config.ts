import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import { formatCurrency } from '@/lib/format';
import type { FilterDefinition } from '@/lib/list-filters';
import type { Wallet } from '@/types/wallet';

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
