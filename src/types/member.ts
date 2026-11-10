export type Member = {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  active: boolean;
};

export type MemberEmployee = {
  id: string;
  person: { id: string; name: string };
};

export type MemberDetails = Member & {
  userId: string;
  roleIds: string[];
  employee: MemberEmployee | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberInput = {
  active?: boolean;
  roleIds?: string[];
};
