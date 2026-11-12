import { CalendarDays, Plus } from 'lucide-react';
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
import type { EventListItem } from '@/types/event';

import { EVENT_DELETE_TEXTS, EVENT_EMPTY_TEXTS, EVENT_FILTERS } from './events-config';

export const metadata: Metadata = {
  title: 'Eventos',
};

type EventsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await requireSession('events.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, EVENT_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, EVENT_FILTERS),
  );

  const events = await apiRequest<Paginated<EventListItem>>(`/events?${query}`, {
    token: session.accessToken,
  });

  if (events.meta.totalPages > 0 && page > events.meta.totalPages) {
    redirect(buildListHref('/admin/events', listQuery, events.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'events.delete');
  const createAction = hasPermission(session, 'events.create') && (
    <Button href='/admin/events/new'>
      <Plus />
      Novo evento
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={CalendarDays}
        title='Eventos'
        description='Cadastre os eventos em que a sua empresa faz ações comerciais, como dias de campo e feiras.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou descrição'
        filters={<ListFilters filters={EVENT_FILTERS} values={filters} />}
      />

      <DataTable
        rows={events.data}
        rowHref={(event) => `/admin/events/${event.id}`}
        primary={{
          header: 'Evento',
          title: (event) => event.name,
          subtitle: (event) => event.description ?? 'Sem descrição',
        }}
        columns={[
          {
            header: 'Ações comerciais',
            visibleFrom: 'sm',
            cell: (event) => event.actionsCount,
          },
          {
            header: 'Cadastro',
            visibleFrom: 'md',
            cell: (event) => formatDate(event.createdAt),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'events.update'),
          deleteDialog: canDelete
            ? (event) => ({
                ...EVENT_DELETE_TEXTS,
                recordName: event.name,
                deletePath: `/events/${event.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={CalendarDays}
            pathname='/admin/events'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={EVENT_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname='/admin/events' query={listQuery} meta={events.meta} />}
      />
    </div>
  );
}
