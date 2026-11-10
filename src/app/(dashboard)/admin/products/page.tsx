import { Package, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { BadgeList } from '@/components/list/badge-list';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Product } from '@/types/product';

import { getProductOptions } from './product-options';
import {
  getProductFilters,
  PRODUCT_DELETE_TEXTS,
  PRODUCT_EMPTY_TEXTS,
  PRODUCTS_HREF,
} from './products-config';

export const metadata: Metadata = {
  title: 'Produtos',
};

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await requireSession('products.read');
  const [params, { manufacturers, groups }] = await Promise.all([
    searchParams,
    getProductOptions(session),
  ]);
  const filterDefinitions = getProductFilters(manufacturers, groups);
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, filterDefinitions),
  );

  const products = await apiRequest<Paginated<Product>>(`/products?${query}`, {
    token: session.accessToken,
  });

  if (products.meta.totalPages > 0 && page > products.meta.totalPages) {
    redirect(buildListHref(PRODUCTS_HREF, listQuery, products.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'products.delete');
  const createAction = hasPermission(session, 'products.create') && (
    <Button href={`${PRODUCTS_HREF}/new`}>
      <Plus />
      Novo produto
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Package}
        title='Produtos'
        description='Catálogo da empresa, com fabricante, grupos e preços de cada produto.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou descrição'
        filters={<ListFilters filters={filterDefinitions} values={filters} />}
      />

      <DataTable
        rows={products.data}
        rowHref={(product) => `${PRODUCTS_HREF}/${product.id}`}
        primary={{
          header: 'Produto',
          title: (product) => product.name,
          subtitle: (product) => product.description ?? 'Sem descrição',
        }}
        columns={[
          {
            header: 'Fabricante',
            visibleFrom: 'md',
            cell: (product) => product.manufacturer.name,
          },
          {
            header: 'Grupos',
            visibleFrom: 'lg',
            cell: (product) => <BadgeList labels={product.groups.map((group) => group.name)} />,
          },
          {
            header: 'Preço',
            visibleFrom: 'sm',
            align: 'end',
            cell: (product) => (product.price === null ? '—' : formatCurrency(product.price)),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'products.update'),
          deleteDialog: canDelete
            ? (product) => ({
                ...PRODUCT_DELETE_TEXTS,
                recordName: product.name,
                deletePath: `/products/${product.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Package}
            pathname={PRODUCTS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={PRODUCT_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={PRODUCTS_HREF} query={listQuery} meta={products.meta} />}
      />
    </div>
  );
}
