export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export type Invitation = {
  id: string;
  email: string;
  roleIds: string[];
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvitationInput = Pick<Invitation, 'email' | 'roleIds'>;

export type InvitationPreview = {
  email: string;
  companyName: string;
  accountExists: boolean;
  status: InvitationStatus;
  expiresAt: string;
};

export type AcceptInvitationInput = {
  token: string;
  name?: string;
  password: string;
};

export type AcceptInvitationResult = {
  companyId: string;
};
