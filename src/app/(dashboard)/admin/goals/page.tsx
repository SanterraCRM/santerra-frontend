import { Plus, Target } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ChartCard } from '@/components/charts/chart-card';
import { ProgressList } from '@/components/charts/progress-list';
import { ProgressMeter } from '@/components/charts/progress-meter';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { ListQuickFilters } from '@/components/list/list-quick-filters';
import { StatusBadge } from '@/components/list/status-badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { resolveComboboxOption } from '@/lib/combobox-sources';
import { formatPercent } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import {
  buildApiListQuery,
  buildListHref,
  getSearchParam,
  parseListParams,
} from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Goal, GoalSummary } from '@/types/goal';

import {
  describeGoal,
  describeTeamTotal,
  formatGoalPeriod,
  formatGoalProgress,
  getGoalFilters,
  getGoalProgress,
  getGoalStatus,
  getGoalTitle,
  getTeamTotalItems,
  GOAL_DELETE_TEXTS,
  GOAL_EMPTY_TEXTS,
  GOAL_STATUS,
  GOAL_STATUS_SHORTCUTS,
  GOALS_HREF,
} from './goals-config';

export const metadata: Metadata = {
  title: 'Metas',
};

type GoalsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const session = await requireSession('goals.read');
  const params = await searchParams;
  const token = session.accessToken;
  const canSearchEmployees = hasPermission(session, 'employees.read');
  const employee = canSearchEmployees
    ? await resolveComboboxOption('employees', getSearchParam(params, 'employeeId'), token)
    : null;
  const filterDefinitions = getGoalFilters({ employee, canSearchEmployees });
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const apiFilters = toApiFilters(filters, filterDefinitions);
  const query = buildApiListQuery({ page, pageSize, search: searchTerm }, apiFilters);
  const summaryQuery = new URLSearchParams(
    Object.entries({ search: searchTerm, ...apiFilters }).filter(([, value]) => value),
  );

  const [goals, summary] = await Promise.all([
    apiRequest<Paginated<Goal>>(`/goals?${query}`, { token }),
    apiRequest<GoalSummary>(`/goals/summary?${summaryQuery}`, { token }),
  ]);

  if (goals.meta.totalPages > 0 && page > goals.meta.totalPages) {
    redirect(buildListHref(GOALS_HREF, listQuery, goals.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'goals.delete');
  const createAction = hasPermission(session, 'goals.create') && canSearchEmployees && (
    <Button href={`${GOALS_HREF}/new`}>
      <Plus />
      Nova meta
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Target}
        title='Metas'
        description='O que cada vendedor precisa alcançar no período e quanto já alcançou.'
        actions={createAction}
        searchPlaceholder='Buscar pelo vendedor ou pela descrição'
        filters={<ListFilters filters={filterDefinitions} values={filters} />}
      />

      <ListQuickFilters
        label='Situação da meta'
        param='status'
        options={GOAL_STATUS_SHORTCUTS}
        pathname={GOALS_HREF}
        query={listQuery}
        pageSize={pageSize}
      />

      {summary.byMetric.length > 0 && (
        <ChartCard title='Total da equipe' description={describeTeamTotal(summary)}>
          <ProgressList
            label='Total da equipe por indicador'
            items={getTeamTotalItems(summary, listQuery, pageSize)}
            emptyMessage='Nenhuma meta na lista.'
          />
        </ChartCard>
      )}

      <DataTable
        rows={goals.data}
        rowHref={(goal) => `${GOALS_HREF}/${goal.id}`}
        primary={{
          header: 'Vendedor',
          title: (goal) => goal.employee.name,
          subtitle: (goal) => describeGoal(goal),
        }}
        columns={[
          {
            header: 'Período',
            visibleFrom: 'lg',
            cell: (goal) => formatGoalPeriod(goal),
          },
          {
            header: 'Progresso',
            visibleFrom: 'sm',
            cell: (goal) => (
              <ProgressMeter
                className='min-w-40'
                label={formatGoalProgress(goal.metric, goal.achieved, goal.targetValue)}
                valueText={formatPercent(getGoalProgress(goal))}
                value={goal.achieved}
                max={goal.targetValue}
              />
            ),
          },
          {
            header: 'Situação',
            cell: (goal) => <StatusBadge {...GOAL_STATUS[getGoalStatus(goal)]} />,
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'goals.update'),
          deleteDialog: canDelete
            ? (goal) => ({
                ...GOAL_DELETE_TEXTS,
                recordName: getGoalTitle(goal),
                deletePath: `/goals/${goal.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Target}
            pathname={GOALS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={GOAL_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={GOALS_HREF} query={listQuery} meta={goals.meta} />}
      />
    </div>
  );
}
