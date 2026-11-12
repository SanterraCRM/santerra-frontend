import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RelatedRecords } from '@/components/crud/related-records';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest, getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { CommercialAction } from '@/types/commercial-action';
import type { Event } from '@/types/event';

import {
  COMMERCIAL_ACTIONS_HREF,
  toActionRecords,
} from '../../commercial-actions/commercial-actions-config';
import EventForm from '../event-form';
import { EVENT_DELETE_TEXTS } from '../events-config';

const RELATED_ACTIONS_LIMIT = 5;

type EventPageProps = {
  params: Promise<{ id: string }>;
};

function getEvent(id: string, token: string): Promise<Event> {
  return getRecordOrNotFound<Event>(`/events/${id}`, token);
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'events.read')) {
    return { title: 'Evento' };
  }

  const { id } = await params;
  const event = await getEvent(id, session.accessToken);

  return { title: event.name };
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await requireSession('events.read');
  const { id } = await params;
  const [event, actions] = await Promise.all([
    getEvent(id, session.accessToken),
    hasPermission(session, 'commercial-actions.read')
      ? apiRequest<Paginated<CommercialAction>>(
          `/commercial-actions?eventId=${id}&limit=${RELATED_ACTIONS_LIMIT}`,
          { token: session.accessToken },
        )
      : null,
  ]);
  const canUpdate = hasPermission(session, 'events.update');
  const canDelete = hasPermission(session, 'events.delete');

  return (
    <RecordPageLayout
      backHref='/admin/events'
      backLabel='Eventos'
      icon={CalendarDays}
      title={event.name}
      description={`Cadastro criado em ${formatDate(event.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...EVENT_DELETE_TEXTS}
            recordName={event.name}
            deletePath={`/events/${event.id}`}
            listHref='/admin/events'
          />
        )
      }
    >
      {canUpdate ? (
        <EventForm event={event} />
      ) : (
        <RecordDetails
          title='Dados do evento'
          fields={[
            { label: 'Nome', value: event.name },
            { label: 'Descrição', value: event.description, wide: true },
          ]}
        />
      )}

      {actions && (
        <RelatedRecords
          title='Ações deste evento'
          description='As ações comerciais mais recentes feitas neste evento.'
          records={toActionRecords(actions.data, 'event')}
          total={actions.meta.total}
          emptyMessage='Nenhuma ação comercial neste evento.'
          viewAllHref={`${COMMERCIAL_ACTIONS_HREF}?eventId=${event.id}`}
          viewAllLabel='Ver todas'
        />
      )}
    </RecordPageLayout>
  );
}
