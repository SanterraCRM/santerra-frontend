'use client';

import { Funnel } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';

import { AsyncCombobox } from '@/components/form/async-combobox';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { toMoneyInputValue, toMoneyParam } from '@/lib/format';
import {
  type FilterDefinition,
  type FilterValues,
  getFilterKeys,
  isRangeFilter,
  type RangeFilterDefinition,
} from '@/lib/list-filters';
import { toHref } from '@/lib/list-params';

const ALL_OPTIONS = 'all';

type FilterFieldProps = {
  filter: FilterDefinition;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
};

type SearchFilterFieldProps = Omit<FilterFieldProps, 'filter'> & {
  filter: Extract<FilterDefinition, { type: 'search' }>;
};

function SearchFilterField({ filter, values, onChange }: SearchFilterFieldProps) {
  const [selected, setSelected] = useState<ComboboxOption | null>(filter.selected);
  const id = `filter-${filter.key}`;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{filter.label}</FieldLabel>
      <AsyncCombobox
        id={id}
        source={filter.source}
        value={values[filter.key] && selected ? [selected] : []}
        emptyOption='Todos'
        onChange={(next) => {
          setSelected(next[0] ?? null);
          onChange(filter.key, next[0]?.value ?? '');
        }}
      />
    </Field>
  );
}

type RangeFilterFieldProps = Omit<FilterFieldProps, 'filter'> & {
  filter: RangeFilterDefinition;
};

function RangeFilterField({ filter, values, onChange }: RangeFilterFieldProps) {
  const from = values[filter.fromKey];
  const to = values[filter.toKey];
  const bounds = [
    { key: filter.fromKey, label: 'De', min: undefined, max: to || undefined },
    { key: filter.toKey, label: 'Até', min: from || undefined, max: undefined },
  ];

  return (
    <FieldSet className='gap-0'>
      <FieldLegend variant='label'>{filter.label}</FieldLegend>
      <div className='grid grid-cols-2 gap-2'>
        {bounds.map((bound) => {
          const id = `filter-${bound.key}`;
          const value = values[bound.key];

          return (
            <Field key={bound.key} className='gap-1.5'>
              <FieldLabel htmlFor={id} className='text-xs text-muted-foreground'>
                {bound.label}
              </FieldLabel>
              {filter.type === 'dateRange' ? (
                <Input
                  id={id}
                  type='date'
                  value={value}
                  min={bound.min}
                  max={bound.max}
                  onChange={(event) => onChange(bound.key, event.target.value)}
                />
              ) : (
                <MoneyInput
                  id={id}
                  value={value ? toMoneyInputValue(Number(value)) : ''}
                  onValueChange={(masked) => onChange(bound.key, toMoneyParam(masked))}
                />
              )}
            </Field>
          );
        })}
      </div>
    </FieldSet>
  );
}

function FilterField({ filter, values, onChange }: FilterFieldProps) {
  if (filter.type === 'select') {
    const id = `filter-${filter.key}`;

    return (
      <Field>
        <FieldLabel htmlFor={id}>{filter.label}</FieldLabel>
        <Select
          value={values[filter.key] || ALL_OPTIONS}
          onValueChange={(value) => onChange(filter.key, value === ALL_OPTIONS ? '' : value)}
        >
          <SelectTrigger id={id} className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value={ALL_OPTIONS}>Todos</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  }

  if (isRangeFilter(filter)) {
    return <RangeFilterField filter={filter} values={values} onChange={onChange} />;
  }

  if (filter.type === 'search') {
    return <SearchFilterField filter={filter} values={values} onChange={onChange} />;
  }

  const { key, options } = filter;
  const selected = values[key].split(',');

  function toggle(value: string, checked: boolean) {
    const next = options
      .map((option) => option.value)
      .filter((option) => (option === value ? checked : selected.includes(option)));

    onChange(key, next.join(','));
  }

  return (
    <FieldSet className='gap-0'>
      <FieldLegend variant='label'>{filter.label}</FieldLegend>
      <FieldGroup data-slot='checkbox-group'>
        {options.map((option) => (
          <Field key={option.value} orientation='horizontal'>
            <Checkbox
              id={`filter-${key}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
            />
            <FieldLabel htmlFor={`filter-${key}-${option.value}`} className='font-normal'>
              {option.label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

type ListFiltersProps = {
  filters: FilterDefinition[];
  values: FilterValues;
};

export function ListFilters({ filters, values }: ListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const [isPending, startTransition] = useTransition();
  const keys = getFilterKeys(filters);
  const activeCount = keys.reduce(
    (count, key) => count + values[key].split(',').filter(Boolean).length,
    0,
  );

  function emptyValues(): FilterValues {
    return Object.fromEntries(keys.map((key) => [key, '']));
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setDraft(values);
    }

    setIsOpen(open);
  }

  function setValue(key: string, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(nextValues: FilterValues) {
    const params = new URLSearchParams(searchParams);

    keys.forEach((key) => {
      if (nextValues[key]) {
        params.set(key, nextValues[key]);
      } else {
        params.delete(key);
      }
    });

    params.delete('page');
    setIsOpen(false);
    startTransition(() => router.push(toHref(pathname, params)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(draft);
  }

  function handleClear() {
    if (activeCount > 0) {
      applyFilters(emptyValues());
    } else {
      setDraft(emptyValues());
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='secondary'>
          {isPending ? <Spinner /> : <Funnel className='fill-current' />}
          Filtros
          {activeCount > 0 && (
            <>
              <span
                aria-hidden='true'
                className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums'
              >
                {activeCount}
              </span>
              <span className='sr-only'>, {activeCount} ativos</span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-88 max-w-[calc(100vw-2rem)] gap-0 p-0'>
        <form noValidate onSubmit={handleSubmit}>
          <div className='border-b px-4 py-3'>
            <PopoverTitle>Filtros</PopoverTitle>
          </div>

          <div className='flex flex-col gap-5 p-4'>
            {filters.map((filter) => (
              <FilterField
                key={isRangeFilter(filter) ? filter.fromKey : filter.key}
                filter={filter}
                values={draft}
                onChange={setValue}
              />
            ))}
          </div>

          <div className='flex justify-end gap-2 border-t px-4 py-3'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleClear}
              disabled={activeCount === 0 && Object.values(draft).every((value) => !value)}
            >
              Limpar
            </Button>
            <Button type='submit' size='sm'>
              Aplicar filtros
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
