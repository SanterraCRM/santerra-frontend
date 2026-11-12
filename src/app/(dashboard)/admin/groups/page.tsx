import { Layers, Plus } from 'lucide-react';
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
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Group } from '@/types/group';

import { GROUP_EMPTY_TEXTS, GROUP_FILTERS, getGroupDeleteTexts } from './groups-config';

export const metadata: Metadata = {
  title: 'Grupos de produtos',
};

type GroupsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const session = await requireSession('groups.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, GROUP_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, GROUP_FILTERS),
  );

  const groups = await apiRequest<Paginated<Group>>(`/groups?${query}`, {
    token: session.accessToken,
  });

  if (groups.meta.totalPages > 0 && page > groups.meta.totalPages) {
    redirect(buildListHref('/admin/groups', listQuery, groups.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'groups.delete');
  const createAction = hasPermission(session, 'groups.create') && (
    <Button href='/admin/groups/new'>
      <Plus />
      Novo grupo
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Layers}
        title='Grupos de produtos'
        description='Organize os produtos do catálogo em grupos, como sementes e fertilizantes.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou descrição'
        filters={<ListFilters filters={GROUP_FILTERS} values={filters} />}
      />

      <DataTable
        rows={groups.data}
        rowHref={(group) => `/admin/groups/${group.id}`}
        primary={{
          header: 'Grupo',
          title: (group) => group.name,
          subtitle: (group) => group.description ?? 'Sem descrição',
        }}
        columns={[
          {
            header: 'Produtos',
            visibleFrom: 'sm',
            cell: (group) => group.productsCount,
          },
          {
            header: 'Cadastro',
            visibleFrom: 'md',
            cell: (group) => formatDate(group.createdAt),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'groups.update'),
          deleteDialog: canDelete
            ? (group) => ({
                ...getGroupDeleteTexts(group.productsCount),
                recordName: group.name,
                deletePath: `/groups/${group.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Layers}
            pathname='/admin/groups'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={GROUP_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname='/admin/groups' query={listQuery} meta={groups.meta} />}
      />
    </div>
  );
}
