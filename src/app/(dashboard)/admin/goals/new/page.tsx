import { Target } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { requireSession } from '@/lib/session';

import GoalForm from '../goal-form';
import { GOALS_HREF } from '../goals-config';

export const metadata: Metadata = {
  title: 'Nova meta',
};

export default async function NewGoalPage() {
  await requireSession(['goals.create', 'employees.read']);

  return (
    <RecordPageLayout
      backHref={GOALS_HREF}
      backLabel='Metas'
      icon={Target}
      title='Nova meta'
      description='Defina o que o vendedor precisa alcançar e em qual período.'
    >
      <GoalForm canSearchEmployees />
    </RecordPageLayout>
  );
}
