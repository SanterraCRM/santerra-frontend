import { Building2 } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { Company } from '@/types/company';

import CompanyForm from './company-form';

export const metadata: Metadata = {
  title: 'Empresa',
};

export default async function CompanyPage() {
  const session = await requireSession('company.update');
  const company = await apiRequest<Company>('/companies/current', {
    token: session.accessToken,
  });

  return (
    <RecordPageLayout
      icon={Building2}
      title='Empresa'
      description={`Os dados da empresa aparecem no menu e no topo para toda a equipe. Empresa criada em ${formatDate(company.createdAt, 'long')}.`}
    >
      <CompanyForm company={company} />
    </RecordPageLayout>
  );
}
