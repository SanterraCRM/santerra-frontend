import { MapPin, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { ListQuickFilters } from '@/components/list/list-quick-filters';
import { StatusBadge } from '@/components/list/status-badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { resolveComboboxOption } from '@/lib/combobox-sources';
import { formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import {
  buildApiListQuery,
  buildListHref,
  getSearchParam,
  parseListParams,
} from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { CommercialTrip } from '@/types/commercial-trip';

import {
  COMMERCIAL_TRIPS_HREF,
  formatNames,
  getTripFilters,
  getTripTitle,
  TRIP_DELETE_TEXTS,
  TRIP_EMPTY_TEXTS,
  TRIP_STATUS,
  TRIP_STATUS_SHORTCUTS,
} from './commercial-trips-config';

export const metadata: Metadata = {
  title: 'Visitas',
};

type CommercialTripsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CommercialTripsPage({ searchParams }: CommercialTripsPageProps) {
  const session = await requireSession('commercial-trips.read');
  const params = await searchParams;
  const token = session.accessToken;
  const canSearchProducers = hasPermission(session, 'producers.read');
  const canSearchEmployees = hasPermission(session, 'employees.read');
  const [producer, responsible] = await Promise.all([
    canSearchProducers
      ? resolveComboboxOption('producers', getSearchParam(params, 'producerId'), token)
      : null,
    canSearchEmployees
      ? resolveComboboxOption('employees', getSearchParam(params, 'responsibleId'), token)
      : null,
  ]);
  const filterDefinitions = getTripFilters({
    producer,
    responsible,
    canSearchProducers,
    canSearchEmployees,
  });
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, filterDefinitions),
  );

  const trips = await apiRequest<Paginated<CommercialTrip>>(`/commercial-trips?${query}`, { token });

  if (trips.meta.totalPages > 0 && page > trips.meta.totalPages) {
    redirect(buildListHref(COMMERCIAL_TRIPS_HREF, listQuery, trips.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'commercial-trips.delete');
  const canCreate =
    hasPermission(session, 'commercial-trips.create') && canSearchProducers && canSearchEmployees;
  const createAction = canCreate && (
    <Button href={`${COMMERCIAL_TRIPS_HREF}/new`}>
      <Plus />
      Nova visita
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={MapPin}
        title='Visitas'
        description='Visitas da equipe aos produtores: o que foi planejado, o que foi feito e o que ficou pendente.'
        actions={createAction}
        searchPlaceholder='Buscar pelo produtor ou pelo responsável'
        filters={<ListFilters filters={filterDefinitions} values={filters} />}
      />

      <ListQuickFilters
        label='Status da visita'
        param='status'
        options={TRIP_STATUS_SHORTCUTS}
        pathname={COMMERCIAL_TRIPS_HREF}
        query={listQuery}
        pageSize={pageSize}
      />

      <DataTable
        rows={trips.data}
        rowHref={(trip) => `${COMMERCIAL_TRIPS_HREF}/${trip.id}`}
        primary={{
          header: 'Produtor',
          title: (trip) => trip.producer.name,
          subtitle: (trip) => formatNames(trip.harvests) || 'Sem culturas',
        }}
        columns={[
          {
            header: 'Responsável',
            visibleFrom: 'md',
            cell: (trip) => trip.responsible.name,
          },
          {
            header: 'Status',
            cell: (trip) => <StatusBadge {...TRIP_STATUS[trip.status]} />,
          },
          {
            header: 'Prevista',
            visibleFrom: 'lg',
            cell: (trip) => (trip.expectedDate ? formatDate(trip.expectedDate) : '—'),
          },
          {
            header: 'Realizada',
            visibleFrom: 'lg',
            cell: (trip) => (trip.tripDate ? formatDate(trip.tripDate) : '—'),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'commercial-trips.update'),
          deleteDialog: canDelete
            ? (trip) => ({
                ...TRIP_DELETE_TEXTS,
                recordName: getTripTitle(trip.producer.name),
                deletePath: `/commercial-trips/${trip.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={MapPin}
            pathname={COMMERCIAL_TRIPS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={TRIP_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination pathname={COMMERCIAL_TRIPS_HREF} query={listQuery} meta={trips.meta} />
        }
      />
    </div>
  );
}
