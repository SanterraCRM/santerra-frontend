import { Plus, Store } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { StatusBadge } from '@/components/list/status-badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatCalendarDate, formatNationalId, normalizeDocumentSearch } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { ResellerView } from '@/types/reseller';

import {
  formatDddPhone,
  getResellerDeleteTexts,
  getResellerName,
  isResellerActive,
  RESELLER_EMPTY_TEXTS,
  RESELLER_FILTERS,
  RESELLERS_HREF,
  toResellerViewRows,
} from './resellers-config';

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

  const resellers = await apiRequest<Paginated<ResellerView>>(`/resellers?${query}`, {
    token: session.accessToken,
  });

  if (resellers.meta.totalPages > 0 && page > resellers.meta.totalPages) {
    redirect(buildListHref(RESELLERS_HREF, listQuery, resellers.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'resellers.delete');
  const createAction = hasPermission(session, 'resellers.create') && (
    <Button href={`${RESELLERS_HREF}/new`}>
      <Plus />
      Nova revenda
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Store}
        title='Revendas'
        description='Revendas cadastradas clientes da santerra.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou CNPJ'
        filters={<ListFilters filters={RESELLER_FILTERS} values={filters} />}
      />

      <DataTable
        rows={toResellerViewRows(resellers.data)}
        rowHref={(reseller) => `${RESELLERS_HREF}/${reseller.id}`}
        primary={{
          header: 'Revenda',
          title: getResellerName,
          subtitle: (reseller) => reseller.email || 'E-mail não informado',
          avatar: true,
        }}
        columns={[
          {
            header: 'CNPJ',
            visibleFrom: 'sm',
            cell: (reseller) => (reseller.document ? formatNationalId(reseller.document) : '—'),
          },
          {
            header: 'Telefone',
            visibleFrom: 'md',
            cell: (reseller) => formatDddPhone(reseller.clientPhoneDDD, reseller.clientPhone) ?? '—',
          },
          {
            header: 'Cadastro',
            visibleFrom: 'lg',
            cell: (reseller) => (reseller.createdAt ? formatCalendarDate(reseller.createdAt) : '—'),
          },
          {
            header: 'Situação',
            visibleFrom: 'sm',
            align: 'end',
            cell: (reseller) =>
              isResellerActive(reseller) ? (
                <StatusBadge label='Ativo' tone='success' />
              ) : (
                <StatusBadge label='Inativo' tone='neutral' />
              ),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'resellers.update'),
          deleteDialog: canDelete
            ? (reseller) => ({
                ...getResellerDeleteTexts(0),
                recordName: getResellerName(reseller),
                deletePath: `/resellers/${reseller.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Store}
            pathname={RESELLERS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={RESELLER_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination pathname={RESELLERS_HREF} query={listQuery} meta={resellers.meta} />
        }
      />
    </div>
  );
}
