import { Factory } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { Manufacturer } from '@/types/manufacturer';

import ManufacturerForm from '../manufacturer-form';
import { MANUFACTURER_DELETE_TEXTS } from '../manufacturers-config';

type ManufacturerPageProps = {
  params: Promise<{ id: string }>;
};

function getManufacturer(id: string, token: string): Promise<Manufacturer> {
  return getRecordOrNotFound<Manufacturer>(`/manufacturers/${id}`, token);
}

export async function generateMetadata({ params }: ManufacturerPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session?.isPlatformAdmin) {
    return { title: 'Fabricante' };
  }

  const { id } = await params;
  const manufacturer = await getManufacturer(id, session.accessToken);

  return { title: manufacturer.name };
}

export default async function ManufacturerPage({ params }: ManufacturerPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const manufacturer = await getManufacturer(id, session.accessToken);

  return (
    <RecordPageLayout
      backHref='/admin/platform/manufacturers'
      backLabel='Fabricantes'
      icon={Factory}
      title={manufacturer.name}
      description={`Cadastro criado em ${formatDate(manufacturer.createdAt, 'long')}`}
      actions={
        <DeleteRecordButton
          {...MANUFACTURER_DELETE_TEXTS}
          recordName={manufacturer.name}
          deletePath={`/manufacturers/${manufacturer.id}`}
          listHref='/admin/platform/manufacturers'
        />
      }
    >
      <ManufacturerForm manufacturer={manufacturer} />
    </RecordPageLayout>
  );
}
