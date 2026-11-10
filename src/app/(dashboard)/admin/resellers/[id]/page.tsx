import { Store } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate, formatNationalId, formatPhone } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Reseller } from '@/types/reseller';

import ResellerForm from '../reseller-form';
import { getResellerDeleteTexts } from '../resellers-config';

type ResellerPageProps = {
  params: Promise<{ id: string }>;
};

function getReseller(id: string, token: string): Promise<Reseller> {
  return getRecordOrNotFound<Reseller>(`/resellers/${id}`, token);
}

export async function generateMetadata({ params }: ResellerPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'resellers.read')) {
    return { title: 'Revenda' };
  }

  const { id } = await params;
  const reseller = await getReseller(id, session.accessToken);

  return { title: reseller.name };
}

export default async function ResellerPage({ params }: ResellerPageProps) {
  const session = await requireSession('resellers.read');
  const { id } = await params;
  const reseller = await getReseller(id, session.accessToken);
  const canUpdate = hasPermission(session, 'resellers.update');
  const canDelete = hasPermission(session, 'resellers.delete');

  return (
    <RecordPageLayout
      backHref='/admin/resellers'
      backLabel='Revendas'
      icon={Store}
      title={reseller.name}
      description={`Cadastro criado em ${formatDate(reseller.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...getResellerDeleteTexts(reseller.actionsCount)}
            recordName={reseller.name}
            deletePath={`/resellers/${reseller.id}`}
            listHref='/admin/resellers'
          />
        )
      }
    >
      {canUpdate ? (
        <ResellerForm reseller={reseller} />
      ) : (
        <RecordDetails
          title='Dados da revenda'
          fields={[
            { label: 'Nome', value: reseller.name, wide: true },
            {
              label: 'CNPJ',
              value: reseller.registrationNumber && formatNationalId(reseller.registrationNumber),
            },
            { label: 'Telefone', value: reseller.phoneNumber && formatPhone(reseller.phoneNumber) },
            { label: 'E-mail', value: reseller.email, wide: true },
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
