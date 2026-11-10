import { Wheat } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';

import HarvestForm from '../harvest-form';

export const metadata: Metadata = {
  title: 'Nova cultura',
};

export default function NewHarvestPage() {
  return (
    <RecordPageLayout
      backHref='/admin/platform/harvests'
      backLabel='Culturas'
      icon={Wheat}
      title='Nova cultura'
      description='Cadastre uma cultura para todas as empresas.'
    >
      <HarvestForm />
    </RecordPageLayout>
  );
}
