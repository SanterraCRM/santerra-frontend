export type Group = {
  id: string;
  name: string;
  description: string | null;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GroupInput = Pick<Group, 'name' | 'description'>;
