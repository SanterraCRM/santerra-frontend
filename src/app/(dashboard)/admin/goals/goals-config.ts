import { Banknote, type LucideIcon, MapPin, Megaphone, Tractor } from 'lucide-react';

import type { ProgressListItem } from '@/components/charts/progress-list';
import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { StatusTone } from '@/components/list/status-badge';
import type { ComboboxOption } from '@/lib/combobox-sources';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatPercent,
  toDateInputValue,
} from '@/lib/format';
import type { FilterDefinition, FilterOption } from '@/lib/list-filters';
import { buildListHref } from '@/lib/list-params';
import type { Goal, GoalMetric, GoalSummary } from '@/types/goal';

import { COMMERCIAL_ACTIONS_HREF } from '../commercial-actions/commercial-actions-config';
import { COMMERCIAL_TRIPS_HREF } from '../commercial-trips/commercial-trips-config';

export const GOALS_HREF = '/admin/goals';

type GoalMetricConfig = {
  label: string;
  description: string;
  icon: LucideIcon;
  targetLabel: string;
  unit?: [singular: string, plural: string];
};

export const GOAL_METRICS: Record<GoalMetric, GoalMetricConfig> = {
  COMPLETED_TRIPS: {
    label: 'Visitas finalizadas',
    description: 'Visitas com o vendedor como responsável, finalizadas com data realizada no período.',
    icon: MapPin,
    targetLabel: 'Meta de visitas',
    unit: ['visita', 'visitas'],
  },
  VISITED_PRODUCERS: {
    label: 'Produtores visitados',
    description: 'Produtores diferentes nas visitas finalizadas do vendedor no período.',
    icon: Tractor,
    targetLabel: 'Meta de produtores',
    unit: ['produtor', 'produtores'],
  },
  COMMERCIAL_ACTIONS: {
    label: 'Ações comerciais',
    description: 'Ações comerciais com o vendedor como responsável e início no período.',
    icon: Megaphone,
    targetLabel: 'Meta de ações',
    unit: ['ação', 'ações'],
  },
  SALES: {
    label: 'Vendas',
    description: 'Valor vendido no período, em reais, lançado à mão até a integração com o ERP.',
    icon: Banknote,
    targetLabel: 'Meta de vendas',
  },
};

export const GOAL_METRIC_OPTIONS: FilterOption[] = Object.entries(GOAL_METRICS).map(
  ([value, { label }]) => ({ value, label }),
);

export type GoalStatusKey = 'achieved' | 'current' | 'upcoming' | 'missed';

export const GOAL_STATUS: Record<GoalStatusKey, { label: string; tone: StatusTone }> = {
  achieved: { label: 'Atingida', tone: 'success' },
  current: { label: 'Em andamento', tone: 'info' },
  upcoming: { label: 'Futura', tone: 'neutral' },
  missed: { label: 'Não atingida', tone: 'warning' },
};

export const GOAL_STATUS_SHORTCUTS: FilterOption[] = [
  { value: 'current', label: 'Em andamento' },
  { value: 'upcoming', label: 'Futuras' },
  { value: 'finished', label: 'Encerradas' },
];

type GoalFilterOptions = {
  employee: ComboboxOption | null;
  canSearchEmployees: boolean;
};

export function getGoalFilters({ employee, canSearchEmployees }: GoalFilterOptions): FilterDefinition[] {
  const filters: FilterDefinition[] = [
    { type: 'select', key: 'metric', label: 'Indicador', options: GOAL_METRIC_OPTIONS },
    { type: 'select', key: 'status', label: 'Situação', options: GOAL_STATUS_SHORTCUTS },
  ];

  if (canSearchEmployees) {
    filters.push({
      type: 'search',
      key: 'employeeId',
      label: 'Vendedor',
      source: 'employees',
      selected: employee,
    });
  }

  filters.push({ type: 'dateRange', label: 'Período', fromKey: 'periodFrom', toKey: 'periodTo' });

  return filters;
}

export const GOAL_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma meta encontrada',
  filtersDescription: 'Nenhuma meta corresponde aos filtros aplicados.',
  searchHint: 'Busque pelo nome do vendedor ou pela descrição da meta.',
  emptyTitle: 'Nenhuma meta cadastrada',
  emptyDescription: 'Cadastre a primeira meta de um vendedor.',
  emptyReadOnlyDescription: 'Quando houver metas cadastradas, elas aparecerão aqui.',
};

export const GOAL_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'A meta sai da lista da empresa. As visitas e ações que ela contava continuam cadastradas. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir meta',
  successMessage: 'Meta excluída.',
  errorMessage: 'Não foi possível excluir a meta. Tente novamente.',
};

export function isSalesMetric(metric: GoalMetric): boolean {
  return metric === 'SALES';
}

export function formatGoalValue(metric: GoalMetric, value: number): string {
  return isSalesMetric(metric) ? formatCurrency(value) : formatDecimal(value);
}

function formatCompactGoalValue(metric: GoalMetric, value: number): string {
  return isSalesMetric(metric) ? formatCompactCurrency(value) : formatDecimal(value);
}

export function formatGoalAmount(metric: GoalMetric, value: number): string {
  const unit = GOAL_METRICS[metric].unit;

  if (!unit) {
    return formatCurrency(value);
  }

  return `${formatDecimal(value)} ${value === 1 ? unit[0] : unit[1]}`;
}

export function getGoalProgress({ achieved, targetValue }: Pick<Goal, 'achieved' | 'targetValue'>) {
  return targetValue > 0 ? achieved / targetValue : 0;
}

export function formatGoalProgress(metric: GoalMetric, achieved: number, target: number): string {
  return `${formatCompactGoalValue(metric, achieved)} de ${formatCompactGoalValue(metric, target)}`;
}

export function describeGoalProgress(goal: Goal): string {
  return `${formatPercent(getGoalProgress(goal))} da meta de ${formatGoalAmount(goal.metric, goal.targetValue)}`;
}

export function getGoalStatus(goal: Goal, today = toDateInputValue(new Date().toISOString())) {
  if (goal.achieved >= goal.targetValue) {
    return 'achieved';
  }

  if (today < toDateInputValue(goal.startDate)) {
    return 'upcoming';
  }

  return today <= toDateInputValue(goal.endDate) ? 'current' : 'missed';
}

export function formatGoalPeriod({ startDate, endDate }: Pick<Goal, 'startDate' | 'endDate'>) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  return start === end ? start : `${start} a ${end}`;
}

export function getGoalTitle({ metric, employee }: Pick<Goal, 'metric' | 'employee'>): string {
  return `Meta de ${GOAL_METRICS[metric].label.toLowerCase()} · ${employee.name}`;
}

export function describeGoal({ metric, description }: Pick<Goal, 'metric' | 'description'>) {
  const label = GOAL_METRICS[metric].label;

  return description ? `${label} · ${description}` : label;
}

export function getGoalRecordsLink(
  goal: Goal,
  permissions: string[],
): { href: string; label: string } | null {
  const can = (permission: string) => permissions.includes(permission);
  const from = toDateInputValue(goal.startDate);
  const to = toDateInputValue(goal.endDate);

  if (isSalesMetric(goal.metric) || !can('employees.read')) {
    return null;
  }

  if (goal.metric === 'COMMERCIAL_ACTIONS') {
    return can('commercial-actions.read')
      ? {
          href: buildListHref(COMMERCIAL_ACTIONS_HREF, {
            responsibleId: goal.employeeId,
            initialFrom: from,
            initialTo: to,
          }),
          label: 'Ver as ações',
        }
      : null;
  }

  return can('commercial-trips.read')
    ? {
        href: buildListHref(COMMERCIAL_TRIPS_HREF, {
          status: 'COMPLETED',
          responsibleId: goal.employeeId,
          tripFrom: from,
          tripTo: to,
        }),
        label: 'Ver as visitas',
      }
    : null;
}

export function formatGoalsCount(count: number): string {
  return count === 1 ? '1 meta' : `${count} metas`;
}

export function describeTeamTotal(summary: GoalSummary): string {
  const total = summary.byMetric.reduce((sum, item) => sum + item.goalsCount, 0);

  return total === 1 ? 'A única meta da lista.' : `Soma das ${total} metas da lista, por indicador.`;
}

export function getTeamTotalItems(
  summary: GoalSummary,
  query: Record<string, string>,
  pageSize: number,
): ProgressListItem[] {
  return summary.byMetric.map(({ metric, goalsCount, targetValue, achieved }) => ({
    key: metric,
    label: GOAL_METRICS[metric].label,
    value: achieved,
    max: targetValue,
    valueText: `${formatGoalProgress(metric, achieved, targetValue)} · ${formatPercent(
      getGoalProgress({ achieved, targetValue }),
    )}`,
    description: formatGoalsCount(goalsCount),
    href:
      query.metric === metric
        ? undefined
        : buildListHref(GOALS_HREF, { ...query, metric }, 1, pageSize),
  }));
}
