import { type LucideIcon, MapPin, Megaphone, Tractor, Wallet } from 'lucide-react';

import type { BarListItem } from '@/components/charts/bar-list';
import type { SegmentedBarItem } from '@/components/charts/segmented-bar';
import type { RelatedRecord } from '@/components/crud/related-records';
import { formatCurrency } from '@/lib/format';
import type { CommercialTripStatus } from '@/types/commercial-trip';
import type { DashboardSummary } from '@/types/dashboard';

import {
  COMMERCIAL_ACTIONS_HREF,
  getActionTitle,
} from './commercial-actions/commercial-actions-config';
import { COMMERCIAL_TRIPS_HREF, TRIP_STATUS } from './commercial-trips/commercial-trips-config';
import { getCreatablePersonTypes } from './persons/person-types';

const integerFormatter = new Intl.NumberFormat('pt-BR');
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });
const TRIP_STATUS_ORDER: CommercialTripStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const PRODUCERS_HREF = '/admin/producers';
const WALLETS_HREF = '/admin/wallets';

export type DashboardStat = {
  key: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

export type DashboardShortcut = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type Summary<K extends keyof DashboardSummary> = NonNullable<DashboardSummary[K]>;

type ShortcutDefinition = DashboardShortcut & {
  isAllowed: (permissions: string[]) => boolean;
};

function hasAll(permissions: string[], required: string[]): boolean {
  return required.every((permission) => permissions.includes(permission));
}

const SHORTCUTS: ShortcutDefinition[] = [
  {
    label: 'Nova visita',
    href: `${COMMERCIAL_TRIPS_HREF}/new`,
    icon: MapPin,
    isAllowed: (permissions) =>
      hasAll(permissions, ['commercial-trips.create', 'producers.read', 'employees.read']),
  },
  {
    label: 'Nova ação comercial',
    href: `${COMMERCIAL_ACTIONS_HREF}/new`,
    icon: Megaphone,
    isAllowed: (permissions) =>
      hasAll(permissions, [
        'commercial-actions.create',
        'events.read',
        'wallets.read',
        'employees.read',
      ]),
  },
  {
    label: 'Novo produtor',
    href: `${PRODUCERS_HREF}/new`,
    icon: Tractor,
    isAllowed: (permissions) =>
      permissions.includes('persons.create') &&
      getCreatablePersonTypes(permissions).includes('producer'),
  },
];

function countLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${integerFormatter.format(count)} ${plural}`;
}

export function getMonthName(month: string): string {
  return monthFormatter.format(new Date(`${month}-01T12:00:00Z`));
}

function getMonthQuery(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return `initialFrom=${month}-01&initialTo=${month}-${String(lastDay).padStart(2, '0')}`;
}

export function getDashboardShortcuts(permissions: string[]): DashboardShortcut[] {
  return SHORTCUTS.filter((shortcut) => shortcut.isAllowed(permissions)).map(
    ({ label, href, icon }) => ({ label, href, icon }),
  );
}

export function hasDashboardData({ producers, trips, actions, wallets }: DashboardSummary): boolean {
  return Boolean(producers || trips || actions || wallets);
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
      href: PRODUCERS_HREF,
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
      href: COMMERCIAL_TRIPS_HREF,
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
          : `Em ${countLabel(actions.byEvent.length, 'tipo de evento', 'tipos de evento')}`,
      icon: Megaphone,
      href: `${COMMERCIAL_ACTIONS_HREF}?${getMonthQuery(actions.month)}`,
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
      href: WALLETS_HREF,
    });
  }

  return stats;
}

export function getTripStatusItems(byStatus: Summary<'trips'>['byStatus']): SegmentedBarItem[] {
  return TRIP_STATUS_ORDER.map((status) => ({
    key: status,
    label: TRIP_STATUS[status].label,
    value: byStatus[status],
    tone: TRIP_STATUS[status].tone,
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
  const monthQuery = getMonthQuery(month);

  return byEvent.map(({ id, name, total }) => ({
    key: id,
    label: name,
    value: total,
    href: `${COMMERCIAL_ACTIONS_HREF}?eventId=${id}&${monthQuery}`,
  }));
}

export function getUpcomingTripRecords(upcoming: Summary<'trips'>['upcoming']): RelatedRecord[] {
  return upcoming.map((trip) => ({
    id: trip.id,
    href: `${COMMERCIAL_TRIPS_HREF}/${trip.id}`,
    title: trip.producer.name,
    subtitle: `Responsável: ${trip.responsible.name}`,
    status: TRIP_STATUS[trip.status],
    date: trip.expectedDate,
  }));
}

export function getRecentActionRecords(recent: Summary<'actions'>['recent']): RelatedRecord[] {
  return recent.map((action) => ({
    id: action.id,
    href: `${COMMERCIAL_ACTIONS_HREF}/${action.id}`,
    title: getActionTitle(action),
    subtitle: `${action.event.name} · Carteira de ${action.wallet.name}`,
    value: action.price ? formatCurrency(action.price) : undefined,
    date: action.initialDate,
  }));
}
