import { Plus, Store } from 'lucide-react';
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
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Reseller } from '@/types/reseller';

import { getResellerDeleteTexts, RESELLER_EMPTY_TEXTS, RESELLER_FILTERS } from './resellers-config';

export const metadata: Metadata = {
  title: 'Revendas',
};

type ResellersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResellersPage({ searchParams }: ResellersPageProps) {
  const session = await requireSession('resellers.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, RESELLER_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: normalizeDocumentSearch(searchTerm) },
    toApiFilters(filters, RESELLER_FILTERS),
  );

  const resellers = await apiRequest<Paginated<Reseller>>(`/resellers?${query}`, {
    token: session.accessToken,
  });

  if (resellers.meta.totalPages > 0 && page > resellers.meta.totalPages) {
    redirect(buildListHref('/admin/resellers', listQuery, resellers.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'resellers.delete');
  const createAction = hasPermission(session, 'resellers.create') && (
    <Button href='/admin/resellers/new'>
      <Plus />
      Nova revenda
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Store}
        title='Revendas'
        description='Gerencie as revendas que a sua empresa convida para as ações comerciais.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou CNPJ'
        filters={<ListFilters filters={RESELLER_FILTERS} values={filters} />}
      />

      <DataTable
        rows={resellers.data}
        rowHref={(reseller) => `/admin/resellers/${reseller.id}`}
        primary={{
          header: 'Revenda',
          title: (reseller) => reseller.name,
          subtitle: (reseller) => reseller.email || 'E-mail não informado',
          avatar: true,
        }}
        columns={[
          {
            header: 'CNPJ',
            visibleFrom: 'sm',
            cell: (reseller) =>
              reseller.registrationNumber ? formatNationalId(reseller.registrationNumber) : '—',
          },
          {
            header: 'Telefone',
            visibleFrom: 'md',
            cell: (reseller) => (reseller.phoneNumber ? formatPhone(reseller.phoneNumber) : '—'),
          },
          {
            header: 'Cadastro',
            visibleFrom: 'lg',
            cell: (reseller) => formatDate(reseller.createdAt),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'resellers.update'),
          deleteDialog: canDelete
            ? (reseller) => ({
                ...getResellerDeleteTexts(reseller.actionsCount),
                recordName: reseller.name,
                deletePath: `/resellers/${reseller.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Store}
            pathname='/admin/resellers'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={RESELLER_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination pathname='/admin/resellers' query={listQuery} meta={resellers.meta} />
        }
      />
    </div>
  );
}
