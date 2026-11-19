import type { Session } from 'next-auth';

import { apiRequest, hasRecords } from '@/lib/api';
import { hasPermission } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { ProductRelation, ProductViewFilterOptions } from '@/types/product';

const EMPTY_FILTER_OPTIONS: ProductViewFilterOptions = {
  manufacturers: [],
  departments: [],
  sections: [],
  categories: [],
  lines: [],
  crops: [],
};

// Valores distintos da view de produtos (e da view de culturas) para montar os filtros da lista.
export function getProductViewFilterOptions(session: Session): Promise<ProductViewFilterOptions> {
  return apiRequest<ProductViewFilterOptions>('/products/filter-options', {
    token: session.accessToken,
  }).catch(() => EMPTY_FILTER_OPTIONS);
}

export type ProductOptions = {
  hasManufacturers: boolean;
  groups: ProductRelation[] | null;
};

export async function getProductGroups(session: Session): Promise<ProductRelation[] | null> {
  if (!hasPermission(session, 'groups.read')) {
    return null;
  }

  const { data } = await apiRequest<Paginated<ProductRelation>>('/groups?limit=100', {
    token: session.accessToken,
  });

  return data
    .map(({ id, name }) => ({ id, name }))
    .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
}

export async function getProductOptions(session: Session): Promise<ProductOptions> {
  const [hasManufacturers, groups] = await Promise.all([
    hasRecords('/manufacturers', session.accessToken),
    getProductGroups(session),
  ]);

  return { hasManufacturers, groups };
}
