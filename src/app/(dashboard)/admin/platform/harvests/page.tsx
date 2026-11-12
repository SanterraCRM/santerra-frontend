import { Plus, Wheat } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Harvest } from '@/types/harvest';

import { getHarvestDeleteTexts, HARVEST_EMPTY_TEXTS, HARVEST_FILTERS } from './harvests-config';

const LIST_HREF = '/admin/platform/harvests';

export const metadata: Metadata = {
  title: 'Culturas',
};

type HarvestsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HarvestsPage({ searchParams }: HarvestsPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, HARVEST_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, HARVEST_FILTERS),
  );

  const harvests = await apiRequest<Paginated<Harvest>>(`/harvests?${query}`, {
    token: session.accessToken,
  });

  if (harvests.meta.totalPages > 0 && page > harvests.meta.totalPages) {
    redirect(buildListHref(LIST_HREF, listQuery, harvests.meta.totalPages, pageSize));
  }

  const createAction = (
    <Button href={`${LIST_HREF}/new`}>
      <Plus />
      Nova cultura
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Wheat}
        title='Culturas'
        description='Culturas, como milho e soja, que todas as empresas usam nas visitas.'
        actions={createAction}
        searchPlaceholder='Buscar por nome'
        filters={<ListFilters filters={HARVEST_FILTERS} values={filters} />}
      />

      <DataTable
        rows={harvests.data}
        rowHref={(harvest) => `${LIST_HREF}/${harvest.id}`}
        primary={{ header: 'Cultura', title: (harvest) => harvest.name }}
        columns={[
          {
            header: 'Visitas',
            visibleFrom: 'sm',
            cell: (harvest) => harvest.tripsCount,
          },
          {
            header: 'Cadastro',
            visibleFrom: 'md',
            cell: (harvest) => formatDate(harvest.createdAt),
          },
        ]}
        actions={{
          canUpdate: true,
          deleteDialog: (harvest) => ({
            ...getHarvestDeleteTexts(harvest.tripsCount),
            recordName: harvest.name,
            deletePath: `/harvests/${harvest.id}`,
          }),
        }}
        emptyState={
          <ListEmptyState
            icon={Wheat}
            pathname={LIST_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={HARVEST_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={LIST_HREF} query={listQuery} meta={harvests.meta} />}
      />
    </div>
  );
}
