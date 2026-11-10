import type { ComboboxOption, ComboboxSourceKey } from './combobox-sources';
import { toDayBoundary } from './format';
import { getSearchParam, isIsoDate, type SearchParams } from './list-params';

const MONEY_PARAM_PATTERN = /^\d{1,12}(\.\d{1,2})?$/;

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterDefinition =
  | { type: 'select'; key: string; label: string; options: FilterOption[] }
  | { type: 'checkboxes'; key: string; label: string; options: FilterOption[] }
  | { type: 'dateRange'; label: string; fromKey: string; toKey: string }
  | { type: 'moneyRange'; label: string; fromKey: string; toKey: string }
  | {
      type: 'search';
      key: string;
      label: string;
      source: ComboboxSourceKey;
      selected: ComboboxOption | null;
    };

export type RangeFilterDefinition = Extract<FilterDefinition, { fromKey: string }>;

export type FilterValues = Record<string, string>;

export function isRangeFilter(filter: FilterDefinition): filter is RangeFilterDefinition {
  return filter.type === 'dateRange' || filter.type === 'moneyRange';
}

export function getFilterKeys(filters: FilterDefinition[]): string[] {
  return filters.flatMap((filter) =>
    isRangeFilter(filter) ? [filter.fromKey, filter.toKey] : [filter.key],
  );
}

function isValidRangeValue(filter: RangeFilterDefinition, value: string): boolean {
  return filter.type === 'dateRange' ? isIsoDate(value) : MONEY_PARAM_PATTERN.test(value);
}

function parseFilter(searchParams: SearchParams, filter: FilterDefinition): [string, string][] {
  if (isRangeFilter(filter)) {
    return [filter.fromKey, filter.toKey].map((key) => {
      const value = getSearchParam(searchParams, key);

      return [key, isValidRangeValue(filter, value) ? value : ''];
    });
  }

  const value = getSearchParam(searchParams, filter.key);

  if (filter.type === 'search') {
    return [[filter.key, filter.selected?.value === value ? value : '']];
  }

  if (filter.type === 'select') {
    return [[filter.key, filter.options.some((option) => option.value === value) ? value : '']];
  }

  const selected = value.split(',');

  return [
    [
      filter.key,
      filter.options
        .filter((option) => selected.includes(option.value))
        .map((option) => option.value)
        .join(','),
    ],
  ];
}

export function parseFilters(searchParams: SearchParams, filters: FilterDefinition[]): FilterValues {
  return Object.fromEntries(filters.flatMap((filter) => parseFilter(searchParams, filter)));
}

export function toApiFilters(values: FilterValues, filters: FilterDefinition[]): FilterValues {
  const apiValues = { ...values };

  filters.forEach((filter) => {
    if (filter.type === 'dateRange') {
      const from = values[filter.fromKey];
      const to = values[filter.toKey];

      apiValues[filter.fromKey] = from && toDayBoundary(from, 'start');
      apiValues[filter.toKey] = to && toDayBoundary(to, 'end');
    }
  });

  return apiValues;
}
