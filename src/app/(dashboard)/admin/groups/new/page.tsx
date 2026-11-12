import { Layers } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import GroupForm from '../group-form';

export const metadata: Metadata = {
  title: 'Novo grupo',
};

export default async function NewGroupPage() {
  await requireSession('groups.create');

  return (
    <RecordPageLayout
      backHref='/admin/groups'
      backLabel='Grupos de produtos'
      icon={Layers}
      title='Novo grupo'
      description='Preencha os dados para cadastrar um grupo de produtos.'
    >
      <GroupForm />
    </RecordPageLayout>
  );
}
