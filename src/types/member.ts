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

export type NewMemberInput = {
  email: string;
  name?: string;
  password?: string;
  roleIds: string[];
};

export type CreateMemberResult = {
  member: MemberDetails;
  accountCreated: boolean;
};
