import { Wheat } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { Harvest } from '@/types/harvest';

import HarvestForm from '../harvest-form';
import { formatTripsCount, getHarvestDeleteTexts } from '../harvests-config';

type HarvestPageProps = {
  params: Promise<{ id: string }>;
};

function getHarvest(id: string, token: string): Promise<Harvest> {
  return getRecordOrNotFound<Harvest>(`/harvests/${id}`, token);
}

export async function generateMetadata({ params }: HarvestPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session?.isPlatformAdmin) {
    return { title: 'Cultura' };
  }

  const { id } = await params;
  const harvest = await getHarvest(id, session.accessToken);

  return { title: harvest.name };
}

export default async function HarvestPage({ params }: HarvestPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const harvest = await getHarvest(id, session.accessToken);

  return (
    <RecordPageLayout
      backHref='/admin/platform/harvests'
      backLabel='Culturas'
      icon={Wheat}
      title={harvest.name}
      description={`${formatTripsCount(harvest.tripsCount)} · Cadastro criado em ${formatDate(harvest.createdAt, 'long')}`}
      actions={
        <DeleteRecordButton
          {...getHarvestDeleteTexts(harvest.tripsCount)}
          recordName={harvest.name}
          deletePath={`/harvests/${harvest.id}`}
          listHref='/admin/platform/harvests'
        />
      }
    >
      <HarvestForm harvest={harvest} />
    </RecordPageLayout>
  );
}
