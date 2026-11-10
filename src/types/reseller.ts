export type Reseller = {
  id: string;
  name: string;
  registrationNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  actionsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ResellerInput = Pick<Reseller, 'name' | 'registrationNumber' | 'phoneNumber' | 'email'>;
