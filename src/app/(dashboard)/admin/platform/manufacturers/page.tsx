import { Factory, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatDate, formatNationalId, formatPhone, normalizeDocumentSearch } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { ManufacturerListItem } from '@/types/manufacturer';

import {
  MANUFACTURER_DELETE_TEXTS,
  MANUFACTURER_EMPTY_TEXTS,
  MANUFACTURER_FILTERS,
} from './manufacturers-config';

const LIST_HREF = '/admin/platform/manufacturers';

export const metadata: Metadata = {
  title: 'Fabricantes',
};

type ManufacturersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ManufacturersPage({ searchParams }: ManufacturersPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, MANUFACTURER_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: normalizeDocumentSearch(searchTerm) },
    toApiFilters(filters, MANUFACTURER_FILTERS),
  );

  const manufacturers = await apiRequest<Paginated<ManufacturerListItem>>(
    `/manufacturers?${query}`,
    { token: session.accessToken },
  );

  if (manufacturers.meta.totalPages > 0 && page > manufacturers.meta.totalPages) {
    redirect(buildListHref(LIST_HREF, listQuery, manufacturers.meta.totalPages, pageSize));
  }

  const createAction = (
    <Button href={`${LIST_HREF}/new`}>
      <Plus />
      Novo fabricante
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Factory}
        title='Fabricantes'
        description='Fabricantes dos produtos, compartilhados por todas as empresas da plataforma.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou CNPJ'
        filters={<ListFilters filters={MANUFACTURER_FILTERS} values={filters} />}
      />

      <DataTable
        rows={manufacturers.data}
        rowHref={(manufacturer) => `${LIST_HREF}/${manufacturer.id}`}
        primary={{
          header: 'Fabricante',
          title: (manufacturer) => manufacturer.name,
          subtitle: (manufacturer) => manufacturer.email || 'E-mail não informado',
          avatar: true,
        }}
        columns={[
          {
            header: 'CNPJ',
            visibleFrom: 'sm',
            cell: (manufacturer) =>
              manufacturer.registrationNumber
                ? formatNationalId(manufacturer.registrationNumber)
                : '—',
          },
          {
            header: 'Telefone',
            visibleFrom: 'lg',
            cell: (manufacturer) =>
              manufacturer.phoneNumber ? formatPhone(manufacturer.phoneNumber) : '—',
          },
          {
            header: 'Produtos',
            visibleFrom: 'md',
            cell: (manufacturer) => manufacturer.productsCount,
          },
          {
            header: 'Cadastro',
            visibleFrom: 'xl',
            cell: (manufacturer) => formatDate(manufacturer.createdAt),
          },
        ]}
        actions={{
          canUpdate: true,
          deleteDialog: (manufacturer) => ({
            ...MANUFACTURER_DELETE_TEXTS,
            recordName: manufacturer.name,
            deletePath: `/manufacturers/${manufacturer.id}`,
          }),
        }}
        emptyState={
          <ListEmptyState
            icon={Factory}
            pathname={LIST_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={MANUFACTURER_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={LIST_HREF} query={listQuery} meta={manufacturers.meta} />}
      />
    </div>
  );
}
