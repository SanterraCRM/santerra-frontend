import type { Metadata } from 'next';

import { BarList } from '@/components/charts/bar-list';
import { ChartCard } from '@/components/charts/chart-card';
import { RelatedRecords } from '@/components/crud/related-records';
import { StatCard } from '@/components/layout/stat-card';
import { apiRequest } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { DashboardSummary } from '@/types/dashboard';

import AccountOverview from './account-overview';
import {
  getDashboardStats,
  getEventSpendingItems,
  getMonthName,
  getPotentialItems,
  getRecentActionRecords,
  getTripStatusItems,
  getUpcomingTripRecords,
} from './dashboard-config';
import WelcomeBanner from './welcome-banner';

export const metadata: Metadata = {
  title: 'Início',
};

export default async function AdminPage() {
  const session = await requireSession();
  const [firstName] = session.user.name.split(' ');
  const summary = await apiRequest<DashboardSummary>('/dashboard/summary', {
    token: session.accessToken,
  });
  const { producers, trips, actions } = summary;
  const stats = getDashboardStats(summary);

  return (
    <div className='flex flex-col gap-6'>
      <WelcomeBanner firstName={firstName} />

      {stats.length > 0 && (
        <ul aria-label='Indicadores' className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {stats.map(({ key, ...stat }) => (
            <li key={key}>
              <StatCard {...stat} />
            </li>
          ))}
        </ul>
      )}

      {(trips || producers || actions) && (
        <div className='grid items-start gap-6 lg:grid-cols-2'>
          {trips && (
            <ChartCard title='Visitas por status' description='Todas as visitas da empresa.'>
              <BarList
                label='Visitas por status'
                items={getTripStatusItems(trips.byStatus)}
                emptyMessage='Nenhuma visita cadastrada.'
              />
            </ChartCard>
          )}
          {producers && (
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
          )}
          {actions && (
            <ChartCard
              title={`Gasto em ${getMonthName(actions.month)} por evento`}
              description='Valor das ações comerciais com início neste mês.'
            >
              <BarList
                label='Gasto do mês por evento'
                items={getEventSpendingItems(actions)}
                formatValue={formatCurrency}
                emptyMessage='Nenhuma ação comercial com início neste mês.'
              />
            </ChartCard>
          )}
        </div>
      )}

      {(trips || actions) && (
        <div className='grid items-start gap-6 lg:grid-cols-2'>
          {trips && (
            <RelatedRecords
              title='Próximas visitas'
              description='Visitas pendentes ou em andamento a partir de hoje.'
              records={getUpcomingTripRecords(trips.upcoming)}
              total={trips.upcoming.length}
              emptyMessage='Nenhuma visita prevista a partir de hoje.'
            />
          )}
          {actions && (
            <RelatedRecords
              title='Últimas ações'
              description='As ações comerciais cadastradas mais recentemente.'
              records={getRecentActionRecords(actions.recent)}
              total={actions.recent.length}
              emptyMessage='Nenhuma ação comercial cadastrada.'
            />
          )}
        </div>
      )}

      <AccountOverview
        userName={session.user.name}
        email={session.user.email}
        companyName={session.company?.name ?? ''}
        companyCount={session.companies.length}
      />
    </div>
  );
}
