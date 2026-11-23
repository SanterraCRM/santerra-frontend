import { Package, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ExpandableBadgeList } from '@/components/list/expandable-badge-list';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { StatusBadge } from '@/components/list/status-badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { ProductView } from '@/types/product';

import { getProductViewFilterOptions } from './product-options';
import {
  formatProductClassification,
  getProductFilters,
  getProductName,
  isProductActive,
  PRODUCT_DELETE_TEXTS,
  PRODUCT_EMPTY_TEXTS,
  PRODUCTS_HREF,
  toProductViewRows,
} from './products-config';

export const metadata: Metadata = {
  title: 'Produtos',
};

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await requireSession('products.read');
  const params = await searchParams;
  const filterDefinitions = getProductFilters(await getProductViewFilterOptions(session));
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, filterDefinitions),
  );

  const products = await apiRequest<Paginated<ProductView>>(`/products?${query}`, {
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
        description='Catálogo de produtos, com fabricante, classificação e culturas atendidas.'
        actions={createAction}
        searchPlaceholder='Buscar por nome'
        filters={<ListFilters filters={filterDefinitions} values={filters} />}
      />

      <DataTable
        rows={toProductViewRows(products.data)}
        rowHref={(product) => `${PRODUCTS_HREF}/${product.id}`}
        primary={{
          header: 'Produto',
          title: getProductName,
          subtitle: (product) => formatProductClassification(product) ?? 'Sem classificação',
        }}
        columns={[
          {
            header: 'Fabricante',
            visibleFrom: 'md',
            cell: (product) => product.manufacturer ?? '—',
          },
          {
            header: 'Culturas',
            visibleFrom: 'lg',
            cell: (product) => <ExpandableBadgeList labels={product.crops} />,
          },
          {
            header: 'Unidade',
            visibleFrom: 'xl',
            cell: (product) => product.stockUnity ?? '—',
          },
          {
            header: 'Situação',
            visibleFrom: 'sm',
            align: 'end',
            cell: (product) =>
              isProductActive(product) ? (
                <StatusBadge label='Ativo' tone='success' />
              ) : (
                <StatusBadge label='Inativo' tone='neutral' />
              ),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'products.update'),
          deleteDialog: canDelete
            ? (product) => ({
                ...PRODUCT_DELETE_TEXTS,
                recordName: getProductName(product),
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
