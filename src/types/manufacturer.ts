export type Manufacturer = {
  id: string;
  name: string;
  registrationNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManufacturerListItem = Manufacturer & {
  productsCount: number;
};

export type ManufacturerInput = Pick<
  Manufacturer,
  'name' | 'registrationNumber' | 'phoneNumber' | 'email'
>;
