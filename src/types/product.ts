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

// Produto vindo da view somente leitura do ERP (GET /products).
export type ProductView = {
  id: number | null;
  product: string | null;
  isActive: number | null;
  manufacturerId: string | null;
  manufacturer: string | null;
  department: string | null;
  section: string | null;
  category: string | null;
  line: string | null;
  stockUnity: string | null;
  purchaseUnity: string | null;
  purchaseQuantity: number | null;
  weight: number | null;
  weightNet: number | null;
  volume: number | null;
  ncm: string | null;
  crops: string[];
};

// GET /products/filter-options
export type ProductViewFilterOptions = {
  manufacturers: ProductRelation[];
  departments: string[];
  sections: string[];
  categories: string[];
  lines: string[];
  crops: string[];
};
