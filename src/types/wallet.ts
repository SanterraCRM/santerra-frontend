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
