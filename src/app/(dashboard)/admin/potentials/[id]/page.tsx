import { Gauge } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate, formatDecimal } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Potential } from '@/types/potential';

import PotentialForm from '../potential-form';
import { POTENTIAL_DELETE_TEXTS } from '../potentials-config';

type PotentialPageProps = {
  params: Promise<{ id: string }>;
};

function getPotential(id: string, token: string): Promise<Potential> {
  return getRecordOrNotFound<Potential>(`/potentials/${id}`, token);
}

export async function generateMetadata({ params }: PotentialPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'potentials.read')) {
    return { title: 'Potencial' };
  }

  const { id } = await params;
  const potential = await getPotential(id, session.accessToken);

  return { title: potential.name };
}

export default async function PotentialPage({ params }: PotentialPageProps) {
  const session = await requireSession('potentials.read');
  const { id } = await params;
  const potential = await getPotential(id, session.accessToken);
  const canUpdate = hasPermission(session, 'potentials.update');
  const canDelete = hasPermission(session, 'potentials.delete');

  return (
    <RecordPageLayout
      backHref='/admin/potentials'
      backLabel='Potenciais'
      icon={Gauge}
      title={potential.name}
      description={`Cadastro criado em ${formatDate(potential.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...POTENTIAL_DELETE_TEXTS}
            recordName={potential.name}
            deletePath={`/potentials/${potential.id}`}
            listHref='/admin/potentials'
          />
        )
      }
    >
      {canUpdate ? (
        <PotentialForm potential={potential} />
      ) : (
        <RecordDetails
          title='Dados do potencial'
          fields={[
            { label: 'Nome', value: potential.name },
            {
              label: 'Valor',
              value: potential.numericValue === null ? null : formatDecimal(potential.numericValue),
            },
            { label: 'Descrição', value: potential.description, wide: true },
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
