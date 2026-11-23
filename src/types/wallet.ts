export type WalletMember = {
  id: string;
  name: string;
  email: string;
};

export type Wallet = {
  id: string;
  value: number;
  userCompanyId: string;
  member: WalletMember;
  createdAt: string;
  updatedAt: string;
};

export type WalletListItem = Wallet & {
  actionsCount: number;
};

export type WalletInput = {
  userCompanyId: string;
  value?: number;
};

export type WalletMovementType = 'INITIAL_BALANCE' | 'ADJUSTMENT' | 'ACTION_DEBIT' | 'ACTION_REFUND';

export type WalletMovementDirection = 'credit' | 'debit';

export type WalletMovementAction = {
  id: string;
  description: string | null;
  deletedAt: string | null;
  event: { id: string; name: string };
};

export type WalletMovement = {
  id: string;
  sequence: number;
  walletId: string;
  type: WalletMovementType;
  amount: number;
  balanceAfter: number;
  reason: string | null;
  commercialActionId: string | null;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  commercialAction: WalletMovementAction | null;
};

export type WalletMovementsSummary = {
  credits: number;
  debits: number;
  count: number;
};

export type WalletAdjustmentInput = {
  direction: WalletMovementDirection;
  amount: number;
  reason: string;
};
