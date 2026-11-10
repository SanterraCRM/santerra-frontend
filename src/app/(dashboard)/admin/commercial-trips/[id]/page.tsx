import { MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { FileAttachments } from '@/components/files/file-attachments';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { StatusBadge } from '@/components/list/status-badge';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { CommercialTrip } from '@/types/commercial-trip';

import CommercialTripForm from '../commercial-trip-form';
import {
  COMMERCIAL_TRIPS_HREF,
  formatNames,
  getTripTitle,
  TRIP_DELETE_TEXTS,
  TRIP_STATUS,
} from '../commercial-trips-config';
import { getTripFormOptions } from '../trip-form-options';

type CommercialTripPageProps = {
  params: Promise<{ id: string }>;
};

function getTrip(id: string, token: string): Promise<CommercialTrip> {
  return getRecordOrNotFound<CommercialTrip>(`/commercial-trips/${id}`, token);
}

function formatOptionalDate(value: string | null): string | null {
  return value ? formatDate(value) : null;
}

export async function generateMetadata({ params }: CommercialTripPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'commercial-trips.read')) {
    return { title: 'Visita' };
  }

  const { id } = await params;
  const trip = await getTrip(id, session.accessToken);

  return { title: getTripTitle(trip.producer.name) };
}

export default async function CommercialTripPage({ params }: CommercialTripPageProps) {
  const session = await requireSession('commercial-trips.read');
  const { id } = await params;
  const canUpdate = hasPermission(session, 'commercial-trips.update');
  const canDelete = hasPermission(session, 'commercial-trips.delete');
  const [trip, options] = await Promise.all([
    getTrip(id, session.accessToken),
    canUpdate ? getTripFormOptions(session) : null,
  ]);
  const title = getTripTitle(trip.producer.name);
  const status = TRIP_STATUS[trip.status];

  return (
    <RecordPageLayout
      backHref={COMMERCIAL_TRIPS_HREF}
      backLabel='Visitas'
      icon={MapPin}
      title={title}
      description={`${status.label} · Cadastro criado em ${formatDate(trip.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...TRIP_DELETE_TEXTS}
            recordName={title}
            deletePath={`/commercial-trips/${trip.id}`}
            listHref={COMMERCIAL_TRIPS_HREF}
          />
        )
      }
    >
      {options ? (
        <CommercialTripForm trip={trip} {...options} />
      ) : (
        <RecordDetails
          title='Dados da visita'
          fields={[
            { label: 'Produtor', value: trip.producer.name },
            { label: 'Responsável', value: trip.responsible.name },
            { label: 'Participantes', value: formatNames(trip.participants), wide: true },
            { label: 'Status', value: <StatusBadge {...status} /> },
            { label: 'Data prevista', value: formatOptionalDate(trip.expectedDate) },
            { label: 'Data realizada', value: formatOptionalDate(trip.tripDate) },
            { label: 'Culturas', value: formatNames(trip.harvests) },
            ...(trip.recommendedProducts
              ? [
                  {
                    label: 'Produtos recomendados',
                    value: formatNames(trip.recommendedProducts),
                    wide: true,
                  },
                ]
              : []),
            { label: 'Ação realizada', value: trip.performedActionDescription, wide: true },
            { label: 'Acompanhamento', value: trip.followUpDetails, wide: true },
            { label: 'Pendências', value: trip.pendingIssuesDescription, wide: true },
            ...(trip.files
              ? [{ label: 'Anexos', value: <FileAttachments files={trip.files} />, wide: true }]
              : []),
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
