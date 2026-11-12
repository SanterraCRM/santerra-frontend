import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import EventForm from '../event-form';

export const metadata: Metadata = {
  title: 'Novo evento',
};

export default async function NewEventPage() {
  await requireSession('events.create');

  return (
    <RecordPageLayout
      backHref='/admin/events'
      backLabel='Eventos'
      icon={CalendarDays}
      title='Novo evento'
      description='Preencha os dados para cadastrar um evento.'
    >
      <EventForm />
    </RecordPageLayout>
  );
}
