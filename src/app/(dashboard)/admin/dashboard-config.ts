import { type LucideIcon, MapPin, Megaphone, Tractor, Wallet } from 'lucide-react';

import type { BarListItem } from '@/components/charts/bar-list';
import type { RelatedRecord } from '@/components/crud/related-records';
import { formatCurrency, formatDate } from '@/lib/format';
import type { CommercialTripStatus } from '@/types/commercial-trip';
import type { DashboardSummary } from '@/types/dashboard';

import {
  COMMERCIAL_ACTIONS_HREF,
  getActionTitle,
} from './commercial-actions/commercial-actions-config';
import { COMMERCIAL_TRIPS_HREF, TRIP_STATUS } from './commercial-trips/commercial-trips-config';

const integerFormatter = new Intl.NumberFormat('pt-BR');
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });
const TRIP_STATUS_ORDER: CommercialTripStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export type DashboardStat = {
  key: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

type Summary<K extends keyof DashboardSummary> = NonNullable<DashboardSummary[K]>;

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${integerFormatter.format(count)} ${plural}`;
}

export function getMonthName(month: string): string {
  return monthFormatter.format(new Date(`${month}-01T12:00:00Z`));
}

function getMonthRange(month: string): { from: string; to: string } {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` };
}

export function getDashboardStats({ producers, trips, actions, wallets }: DashboardSummary): DashboardStat[] {
  const stats: DashboardStat[] = [];

  if (producers) {
    const potentials = producers.byPotential.filter((potential) => potential.count > 0).length;

    stats.push({
      key: 'producers',
      label: 'Produtores',
      value: integerFormatter.format(producers.total),
      description:
        producers.total === 0
          ? 'Nenhum produtor cadastrado'
          : `Em ${countLabel(potentials, 'potencial', 'potenciais')}`,
      icon: Tractor,
    });
  }

  if (trips) {
    const { PENDING, IN_PROGRESS } = trips.byStatus;

    stats.push({
      key: 'trips',
      label: 'Visitas em aberto',
      value: integerFormatter.format(PENDING + IN_PROGRESS),
      description: `${countLabel(PENDING, 'pendente', 'pendentes')} · ${integerFormatter.format(IN_PROGRESS)} em andamento`,
      icon: MapPin,
    });
  }

  if (actions) {
    stats.push({
      key: 'actions',
      label: `Gasto em ${getMonthName(actions.month)}`,
      value: formatCurrency(actions.monthTotal),
      description:
        actions.byEvent.length === 0
          ? 'Nenhuma ação com início neste mês'
          : `Em ${countLabel(actions.byEvent.length, 'evento', 'eventos')}`,
      icon: Megaphone,
    });
  }

  if (wallets) {
    stats.push({
      key: 'wallets',
      label: 'Saldo das carteiras',
      value: formatCurrency(wallets.totalBalance),
      description:
        wallets.count === 0
          ? 'Nenhuma carteira criada'
          : `Em ${countLabel(wallets.count, 'carteira', 'carteiras')}`,
      icon: Wallet,
    });
  }

  return stats;
}

export function getTripStatusItems(byStatus: Summary<'trips'>['byStatus']): BarListItem[] {
  return TRIP_STATUS_ORDER.map((status) => ({
    key: status,
    label: TRIP_STATUS[status].label,
    value: byStatus[status],
    href: `${COMMERCIAL_TRIPS_HREF}?status=${status}`,
  }));
}

export function getPotentialItems(
  byPotential: Summary<'producers'>['byPotential'],
  canOpenPotential: boolean,
): BarListItem[] {
  return byPotential
    .filter((potential) => potential.count > 0)
    .map(({ id, name, count }) => ({
      key: id,
      label: name,
      value: count,
      href: canOpenPotential ? `/admin/potentials/${id}` : undefined,
    }));
}

export function getEventSpendingItems({ month, byEvent }: Summary<'actions'>): BarListItem[] {
  const { from, to } = getMonthRange(month);

  return byEvent.map(({ id, name, total }) => ({
    key: id,
    label: name,
    value: total,
    href: `${COMMERCIAL_ACTIONS_HREF}?eventId=${id}&initialFrom=${from}&initialTo=${to}`,
  }));
}

export function getUpcomingTripRecords(upcoming: Summary<'trips'>['upcoming']): RelatedRecord[] {
  return upcoming.map((trip) => ({
    id: trip.id,
    href: `${COMMERCIAL_TRIPS_HREF}/${trip.id}`,
    title: trip.producer.name,
    subtitle: `${trip.expectedDate ? formatDate(trip.expectedDate) : 'Sem data'} · Responsável: ${trip.responsible.name}`,
    status: TRIP_STATUS[trip.status],
  }));
}

export function getRecentActionRecords(recent: Summary<'actions'>['recent']): RelatedRecord[] {
  return recent.map((action) => ({
    id: action.id,
    href: `${COMMERCIAL_ACTIONS_HREF}/${action.id}`,
    title: getActionTitle(action),
    subtitle: `${action.event.name} · Carteira de ${action.wallet.name}`,
    value: action.price ? formatCurrency(action.price) : undefined,
  }));
}
