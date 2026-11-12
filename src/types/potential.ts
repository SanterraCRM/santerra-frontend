export type Potential = {
  id: string;
  name: string;
  numericValue: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PotentialListItem = Potential & {
  producersCount: number;
};

export type PotentialInput = Pick<Potential, 'name' | 'numericValue' | 'description'>;
