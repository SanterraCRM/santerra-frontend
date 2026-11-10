import { Building } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';

import CompanyForm from '../company-form';
import { PLATFORM_COMPANIES_HREF } from '../companies-config';

export const metadata: Metadata = {
  title: 'Nova empresa',
};

export default function NewPlatformCompanyPage() {
  return (
    <RecordPageLayout
      backHref={PLATFORM_COMPANIES_HREF}
      backLabel='Empresas'
      icon={Building}
      title='Nova empresa'
      description='A empresa já nasce com o dono, que pode convidar a equipe.'
    >
      <CompanyForm />
    </RecordPageLayout>
  );
}
