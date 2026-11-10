import type { Session } from 'next-auth';

import { apiRequest } from '@/lib/api';
import { hasPermission } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { ProductRelation } from '@/types/product';

export type ProductOptions = {
  manufacturers: ProductRelation[];
  groups: ProductRelation[] | null;
};

function toSortedRelations({ data }: Paginated<ProductRelation>): ProductRelation[] {
  return data
    .map(({ id, name }) => ({ id, name }))
    .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
}

export async function getProductOptions(session: Session): Promise<ProductOptions> {
  const [manufacturers, groups] = await Promise.all([
    apiRequest<Paginated<ProductRelation>>('/manufacturers?limit=100', {
      token: session.accessToken,
    }),
    hasPermission(session, 'groups.read')
      ? apiRequest<Paginated<ProductRelation>>('/groups?limit=100', { token: session.accessToken })
      : null,
  ]);

  return {
    manufacturers: toSortedRelations(manufacturers),
    groups: groups && toSortedRelations(groups),
  };
}
