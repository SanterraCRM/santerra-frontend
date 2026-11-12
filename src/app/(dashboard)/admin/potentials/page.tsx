import { Gauge, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatDate, formatDecimal } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { PotentialListItem } from '@/types/potential';

import {
  POTENTIAL_DELETE_TEXTS,
  POTENTIAL_EMPTY_TEXTS,
  POTENTIAL_FILTERS,
} from './potentials-config';

export const metadata: Metadata = {
  title: 'Potenciais',
};

type PotentialsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PotentialsPage({ searchParams }: PotentialsPageProps) {
  const session = await requireSession('potentials.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, POTENTIAL_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, POTENTIAL_FILTERS),
  );

  const potentials = await apiRequest<Paginated<PotentialListItem>>(`/potentials?${query}`, {
    token: session.accessToken,
  });

  if (potentials.meta.totalPages > 0 && page > potentials.meta.totalPages) {
    redirect(
      buildListHref('/admin/potentials', listQuery, potentials.meta.totalPages, pageSize),
    );
  }

  const canDelete = hasPermission(session, 'potentials.delete');
  const createAction = hasPermission(session, 'potentials.create') && (
    <Button href='/admin/potentials/new'>
      <Plus />
      Novo potencial
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Gauge}
        title='Potenciais'
        description='Defina a escala que classifica os produtores da sua empresa.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou descrição'
        filters={<ListFilters filters={POTENTIAL_FILTERS} values={filters} />}
      />

      <DataTable
        rows={potentials.data}
        rowHref={(potential) => `/admin/potentials/${potential.id}`}
        primary={{
          header: 'Potencial',
          title: (potential) => potential.name,
          subtitle: (potential) => potential.description ?? 'Sem descrição',
        }}
        columns={[
          {
            header: 'Valor',
            visibleFrom: 'sm',
            cell: (potential) =>
              potential.numericValue === null ? '—' : formatDecimal(potential.numericValue),
          },
          {
            header: 'Produtores',
            visibleFrom: 'md',
            cell: (potential) => potential.producersCount,
          },
          {
            header: 'Cadastro',
            visibleFrom: 'lg',
            cell: (potential) => formatDate(potential.createdAt),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'potentials.update'),
          deleteDialog: canDelete
            ? (potential) => ({
                ...POTENTIAL_DELETE_TEXTS,
                recordName: potential.name,
                deletePath: `/potentials/${potential.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Gauge}
            pathname='/admin/potentials'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={POTENTIAL_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination pathname='/admin/potentials' query={listQuery} meta={potentials.meta} />
        }
      />
    </div>
  );
}
