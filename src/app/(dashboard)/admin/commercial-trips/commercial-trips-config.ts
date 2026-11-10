import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { RelatedRecord } from '@/components/crud/related-records';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { StatusTone } from '@/components/list/status-badge';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { formatDate } from '@/lib/format';
import type { FilterDefinition, FilterOption } from '@/lib/list-filters';
import type {
  CommercialTrip,
  CommercialTripRelation,
  CommercialTripStatus,
} from '@/types/commercial-trip';

export const COMMERCIAL_TRIPS_HREF = '/admin/commercial-trips';

export const TRIP_STATUS: Record<CommercialTripStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pendente', tone: 'warning' },
  IN_PROGRESS: { label: 'Em andamento', tone: 'info' },
  COMPLETED: { label: 'Finalizada', tone: 'success' },
};

export const TRIP_STATUS_OPTIONS: FilterOption[] = Object.entries(TRIP_STATUS).map(
  ([value, { label }]) => ({ value, label }),
);

export const TRIP_STATUS_SHORTCUTS: FilterOption[] = [
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Finalizadas' },
];

type TripFilterOptions = {
  producer: ComboboxOption | null;
  responsible: ComboboxOption | null;
  canSearchProducers: boolean;
  canSearchEmployees: boolean;
};

export function getTripFilters({
  producer,
  responsible,
  canSearchProducers,
  canSearchEmployees,
}: TripFilterOptions): FilterDefinition[] {
  const filters: FilterDefinition[] = [
    { type: 'select', key: 'status', label: 'Status', options: TRIP_STATUS_OPTIONS },
  ];

  if (canSearchEmployees) {
    filters.push({
      type: 'search',
      key: 'responsibleId',
      label: 'Responsável',
      source: 'employees',
      selected: responsible,
    });
  }

  if (canSearchProducers) {
    filters.push({
      type: 'search',
      key: 'producerId',
      label: 'Produtor',
      source: 'producers',
      selected: producer,
    });
  }

  filters.push(
    { type: 'dateRange', label: 'Data prevista', fromKey: 'expectedFrom', toKey: 'expectedTo' },
    { type: 'dateRange', label: 'Data realizada', fromKey: 'tripFrom', toKey: 'tripTo' },
  );

  return filters;
}

export const TRIP_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma visita encontrada',
  filtersDescription: 'Nenhuma visita corresponde aos filtros aplicados.',
  searchHint: 'Busque pelo nome do produtor ou do responsável.',
  emptyTitle: 'Nenhuma visita cadastrada',
  emptyDescription: 'Cadastre a primeira visita a um produtor.',
  emptyReadOnlyDescription: 'Quando houver visitas cadastradas, elas aparecerão aqui.',
};

export const TRIP_DELETE_TEXTS: DeleteDialogTexts = {
  description: 'A visita sai da lista da empresa. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir visita',
  successMessage: 'Visita excluída.',
  errorMessage: 'Não foi possível excluir a visita. Tente novamente.',
};

export function formatNames(relations: CommercialTripRelation[]): string {
  return relations.map((relation) => relation.name).join(', ');
}

export function getTripTitle(producerName: string): string {
  return `Visita a ${producerName}`;
}

function describeTripDate({ tripDate, expectedDate }: CommercialTrip): string {
  if (tripDate) {
    return `Realizada em ${formatDate(tripDate)}`;
  }

  return expectedDate ? `Prevista para ${formatDate(expectedDate)}` : 'Sem data prevista';
}

export function toTripRecords(
  trips: CommercialTrip[],
  perspective: 'producer' | 'responsible',
): RelatedRecord[] {
  return trips.map((trip) => ({
    id: trip.id,
    href: `${COMMERCIAL_TRIPS_HREF}/${trip.id}`,
    title: perspective === 'producer' ? describeTripDate(trip) : trip.producer.name,
    subtitle:
      perspective === 'producer' ? `Responsável: ${trip.responsible.name}` : describeTripDate(trip),
    status: TRIP_STATUS[trip.status],
  }));
}
