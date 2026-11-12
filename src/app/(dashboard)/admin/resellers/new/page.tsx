import { Store } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import ResellerForm from '../reseller-form';

export const metadata: Metadata = {
  title: 'Nova revenda',
};

export default async function NewResellerPage() {
  await requireSession('resellers.create');

  return (
    <RecordPageLayout
      backHref='/admin/resellers'
      backLabel='Revendas'
      icon={Store}
      title='Nova revenda'
      description='Preencha os dados para cadastrar uma revenda.'
    >
      <ResellerForm />
    </RecordPageLayout>
  );
}
