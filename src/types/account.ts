export type Account = {
  id: string;
  name: string;
  email: string;
  isPlatformAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountSession = {
  user: Account;
};

export type ProfileInput = Pick<Account, 'name'>;

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
