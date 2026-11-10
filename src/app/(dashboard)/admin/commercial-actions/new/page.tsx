import { Megaphone } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import { getActionFormOptions } from '../action-form-options';
import CommercialActionForm from '../commercial-action-form';
import { COMMERCIAL_ACTIONS_HREF } from '../commercial-actions-config';

export const metadata: Metadata = {
  title: 'Nova ação comercial',
};

export default async function NewCommercialActionPage() {
  const session = await requireSession([
    'commercial-actions.create',
    'events.read',
    'wallets.read',
    'employees.read',
  ]);
  const options = await getActionFormOptions(session);

  return (
    <RecordPageLayout
      backHref={COMMERCIAL_ACTIONS_HREF}
      backLabel='Ações comerciais'
      icon={Megaphone}
      title='Nova ação comercial'
      description='Preencha os dados para registrar uma ação comercial num evento.'
    >
      <CommercialActionForm {...options} />
    </RecordPageLayout>
  );
}
