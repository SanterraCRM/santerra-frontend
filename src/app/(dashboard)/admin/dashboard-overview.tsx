import { LayoutDashboard } from 'lucide-react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

import { BarList } from '@/components/charts/bar-list';
import { ChartCard } from '@/components/charts/chart-card';
import { SegmentedBar } from '@/components/charts/segmented-bar';
import { RecordList } from '@/components/crud/record-list';
import { ErrorState } from '@/components/layout/error-state';
import { MetricCard } from '@/components/layout/metric-card';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { apiRequest, isApiErrorWithStatus } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { hasPermission } from '@/lib/session';
import type { DashboardSummary } from '@/types/dashboard';

import { COMMERCIAL_ACTIONS_HREF } from './commercial-actions/commercial-actions-config';
import { COMMERCIAL_TRIPS_HREF } from './commercial-trips/commercial-trips-config';
import {
  getDashboardStats,
  getEventSpendingItems,
  getMonthName,
  getPotentialItems,
  getRecentActionRecords,
  getTripStatusItems,
  getUpcomingTripRecords,
  hasDashboardData,
} from './dashboard-config';

const METRIC_COLUMNS: Record<number, string> = {
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
};

type DashboardRowProps = {
  main: ReactNode;
  side: ReactNode;
};

function DashboardRow({ main, side }: DashboardRowProps) {
  if (!main && !side) {
    return null;
  }

  return (
    <div className='grid gap-6 xl:grid-cols-3'>
      {main && <div className={cn('grid min-w-0', side ? 'xl:col-span-2' : 'xl:col-span-3')}>{main}</div>}
      {side && <div className={cn('grid min-w-0', !main && 'xl:col-span-3')}>{side}</div>}
    </div>
  );
}

type ViewAllButtonProps = {
  href: string;
};

function ViewAllButton({ href }: ViewAllButtonProps) {
  return (
    <Button href={href} variant='outline' size='sm'>
      Ver todas
    </Button>
  );
}

type DashboardOverviewProps = {
  session: Session;
};

export default async function DashboardOverview({ session }: DashboardOverviewProps) {
  let summary: DashboardSummary;

  try {
    summary = await apiRequest<DashboardSummary>('/dashboard/summary', {
      token: session.accessToken,
    });
  } catch (error) {
    if (isApiErrorWithStatus(error, 401)) {
      throw error;
    }

    return <ErrorState />;
  }

  if (!hasDashboardData(summary)) {
    return (
      <Empty className='border bg-card animate-fade-up [animation-delay:80ms]'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <LayoutDashboard />
          </EmptyMedia>
          <EmptyTitle>Nada para mostrar por aqui ainda</EmptyTitle>
          <EmptyDescription>
            O seu cargo ainda não dá acesso aos módulos que aparecem no Início. Peça a quem
            administra a empresa para ajustar o seu acesso.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { producers, trips, actions } = summary;
  const stats = getDashboardStats(summary);
  const tripsTotal = trips ? Object.values(trips.byStatus).reduce((sum, count) => sum + count, 0) : 0;
  const recentActions = actions ? getRecentActionRecords(actions.recent) : [];

  return (
    <div className='flex flex-col gap-6'>
      <ul
        aria-label='Indicadores'
        className={cn('grid grid-cols-2 gap-3 sm:gap-4', METRIC_COLUMNS[stats.length] ?? 'xl:grid-cols-4')}
      >
        {stats.map(({ key, ...stat }) => (
          <li key={key} className='grid'>
            <MetricCard {...stat} />
          </li>
        ))}
      </ul>

      <DashboardRow
        main={
          trips && (
            <ChartCard
              title='Visitas'
              description='A situação de todas as visitas e as próximas a partir de hoje.'
              action={tripsTotal > 0 && <ViewAllButton href={COMMERCIAL_TRIPS_HREF} />}
            >
              {tripsTotal === 0 ? (
                <p className='text-sm text-muted-foreground'>Nenhuma visita cadastrada.</p>
              ) : (
                <div className='flex flex-col gap-6'>
                  <SegmentedBar label='Visitas por situação' items={getTripStatusItems(trips.byStatus)} />
                  <section aria-labelledby='upcoming-trips' className='flex flex-col gap-2'>
                    <h3
                      id='upcoming-trips'
                      className='text-xs font-medium tracking-wide text-muted-foreground uppercase'
                    >
                      Próximas visitas
                    </h3>
                    <RecordList
                      records={getUpcomingTripRecords(trips.upcoming)}
                      emptyMessage='Nenhuma visita prevista a partir de hoje.'
                    />
                  </section>
                </div>
              )}
            </ChartCard>
          )
        }
        side={
          producers && (
            <ChartCard
              title='Produtores por potencial'
              description='Quantos produtores a empresa tem em cada potencial.'
            >
              <BarList
                label='Produtores por potencial'
                items={getPotentialItems(producers.byPotential, hasPermission(session, 'potentials.read'))}
                emptyMessage='Nenhum produtor cadastrado.'
              />
            </ChartCard>
          )
        }
      />

      <DashboardRow
        main={
          actions && (
            <ChartCard
              title='Últimas ações comerciais'
              description='As ações comerciais cadastradas mais recentemente.'
              action={recentActions.length > 0 && <ViewAllButton href={COMMERCIAL_ACTIONS_HREF} />}
            >
              <RecordList records={recentActions} emptyMessage='Nenhuma ação comercial cadastrada.' />
            </ChartCard>
          )
        }
        side={
          actions && (
            <ChartCard
              title={`Gasto em ${getMonthName(actions.month)} por tipo de evento`}
              description='Valor das ações comerciais com início neste mês.'
            >
              <BarList
                label='Gasto do mês por tipo de evento'
                items={getEventSpendingItems(actions)}
                formatValue={formatCurrency}
                emptyMessage='Nenhuma ação comercial com início neste mês.'
              />
            </ChartCard>
          )
        }
      />
    </div>
  );
}
