import type { StoredFile } from './file';

export type ProductRelation = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  costPrice: number | null;
  manufacturerId: string;
  groupIds: string[];
  fileIds: string[];
  manufacturer: ProductRelation;
  groups: ProductRelation[];
  files: StoredFile[] | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Pick<
  Product,
  'name' | 'description' | 'price' | 'costPrice' | 'manufacturerId'
> & {
  groupIds?: string[];
  fileIds?: string[];
};
