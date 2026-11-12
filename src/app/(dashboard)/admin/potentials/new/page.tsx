import { Gauge } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import PotentialForm from '../potential-form';

export const metadata: Metadata = {
  title: 'Novo potencial',
};

export default async function NewPotentialPage() {
  await requireSession('potentials.create');

  return (
    <RecordPageLayout
      backHref='/admin/potentials'
      backLabel='Potenciais'
      icon={Gauge}
      title='Novo potencial'
      description='Preencha os dados para cadastrar um potencial de produtor.'
    >
      <PotentialForm />
    </RecordPageLayout>
  );
}
