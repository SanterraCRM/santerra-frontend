import { ExternalLink, Target } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { ProgressMeter } from '@/components/charts/progress-meter';
import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { StatCard } from '@/components/layout/stat-card';
import { Button } from '@/components/ui/button';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Goal } from '@/types/goal';

import GoalForm from '../goal-form';
import {
  describeGoalProgress,
  formatGoalAmount,
  formatGoalPeriod,
  formatGoalValue,
  getGoalRecordsLink,
  getGoalStatus,
  getGoalTitle,
  GOAL_DELETE_TEXTS,
  GOAL_METRICS,
  GOAL_STATUS,
  GOALS_HREF,
  isSalesMetric,
} from '../goals-config';

type GoalPageProps = {
  params: Promise<{ id: string }>;
};

function getGoal(id: string, token: string): Promise<Goal> {
  return getRecordOrNotFound<Goal>(`/goals/${id}`, token);
}

export async function generateMetadata({ params }: GoalPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'goals.read')) {
    return { title: 'Meta' };
  }

  const { id } = await params;
  const goal = await getGoal(id, session.accessToken);

  return { title: getGoalTitle(goal) };
}

export default async function GoalPage({ params }: GoalPageProps) {
  const session = await requireSession('goals.read');
  const { id } = await params;
  const goal = await getGoal(id, session.accessToken);
  const title = getGoalTitle(goal);
  const status = GOAL_STATUS[getGoalStatus(goal)];
  const metric = GOAL_METRICS[goal.metric];
  const recordsLink = getGoalRecordsLink(goal, session.permissions);

  return (
    <RecordPageLayout
      backHref={GOALS_HREF}
      backLabel='Metas'
      icon={Target}
      title={title}
      description={`${status.label} · ${formatGoalPeriod(goal)}`}
      actions={
        hasPermission(session, 'goals.delete') && (
          <DeleteRecordButton
            {...GOAL_DELETE_TEXTS}
            recordName={title}
            deletePath={`/goals/${goal.id}`}
            listHref={GOALS_HREF}
          />
        )
      }
    >
      <StatCard
        label='Realizado'
        value={formatGoalValue(goal.metric, goal.achieved)}
        description={describeGoalProgress(goal)}
        icon={metric.icon}
        action={
          recordsLink && (
            <Button href={recordsLink.href} variant='outline'>
              <ExternalLink />
              {recordsLink.label}
            </Button>
          )
        }
      >
        <ProgressMeter value={goal.achieved} max={goal.targetValue} />
      </StatCard>

      {hasPermission(session, 'goals.update') ? (
        <GoalForm goal={goal} canSearchEmployees={hasPermission(session, 'employees.read')} />
      ) : (
        <RecordDetails
          title='Dados da meta'
          fields={[
            { label: 'Vendedor', value: goal.employee.name },
            { label: 'Indicador', value: metric.label },
            { label: 'Início', value: formatDate(goal.startDate) },
            { label: 'Fim', value: formatDate(goal.endDate) },
            { label: metric.targetLabel, value: formatGoalAmount(goal.metric, goal.targetValue) },
            ...(isSalesMetric(goal.metric)
              ? [{ label: 'Vendido no período', value: formatGoalValue(goal.metric, goal.achieved) }]
              : []),
            { label: 'Como é calculado', value: metric.description, wide: true },
            { label: 'Descrição', value: goal.description, wide: true },
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
