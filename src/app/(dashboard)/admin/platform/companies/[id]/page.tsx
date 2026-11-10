import { Building } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { PlatformCompany } from '@/types/platform';

import CompanyForm from '../company-form';
import { formatMembersCount, PLATFORM_COMPANIES_HREF } from '../companies-config';

type PlatformCompanyPageProps = {
  params: Promise<{ id: string }>;
};

function getCompany(id: string, token: string): Promise<PlatformCompany> {
  return getRecordOrNotFound<PlatformCompany>(`/companies/${id}`, token);
}

export async function generateMetadata({ params }: PlatformCompanyPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session?.isPlatformAdmin) {
    return { title: 'Empresa' };
  }

  const { id } = await params;
  const company = await getCompany(id, session.accessToken);

  return { title: company.name };
}

export default async function PlatformCompanyPage({ params }: PlatformCompanyPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const company = await getCompany(id, session.accessToken);

  return (
    <RecordPageLayout
      backHref={PLATFORM_COMPANIES_HREF}
      backLabel='Empresas'
      icon={Building}
      title={company.name}
      description={`${formatMembersCount(company.membersCount)} · Cadastro criado em ${formatDate(company.createdAt, 'long')}`}
    >
      <CompanyForm company={company} />
      <RecordDetails
        title='Dono'
        description='Quem administra a empresa, com o cargo Administrador e todas as permissões.'
        fields={[
          { label: 'Nome', value: company.owner?.name ?? null },
          { label: 'E-mail', value: company.owner?.email ?? null },
        ]}
      />
    </RecordPageLayout>
  );
}
