export type Company = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  active: boolean;
  owner: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = Pick<Company, 'name' | 'description'>;

export type NewCompanyInput = CompanyInput & {
  logo: File | null;
};
