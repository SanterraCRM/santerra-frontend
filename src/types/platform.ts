export type PlatformCompany = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  active: boolean;
  owner: { id: string; name: string; email: string } | null;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PlatformCompanyInput = {
  name: string;
  description: string | null;
  active: boolean;
};

export type NewPlatformCompanyInput = {
  name: string;
  description: string | null;
  ownerEmail: string;
  logo: File | null;
};

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  isPlatformAdmin: boolean;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformUserInput = {
  name: string;
  email: string;
  active: boolean;
  password?: string;
};
