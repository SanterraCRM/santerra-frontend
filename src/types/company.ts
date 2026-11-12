export type Company = {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = Pick<Company, 'name' | 'description'>;
