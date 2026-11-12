import { MapPin } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import CommercialTripForm from '../commercial-trip-form';
import { COMMERCIAL_TRIPS_HREF } from '../commercial-trips-config';
import { getTripFormOptions } from '../trip-form-options';

export const metadata: Metadata = {
  title: 'Nova visita',
};

export default async function NewCommercialTripPage() {
  const session = await requireSession(['commercial-trips.create', 'producers.read', 'employees.read']);
  const options = await getTripFormOptions(session);

  return (
    <RecordPageLayout
      backHref={COMMERCIAL_TRIPS_HREF}
      backLabel='Visitas'
      icon={MapPin}
      title='Nova visita'
      description='Preencha os dados para registrar uma visita a um produtor.'
    >
      <CommercialTripForm {...options} />
    </RecordPageLayout>
  );
}
