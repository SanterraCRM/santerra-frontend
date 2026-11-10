'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { type Ref, useId, useState } from 'react';

import { BadgeList } from '@/components/list/badge-list';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { useComboboxSearch } from '@/hooks/use-combobox-search';
import { cn } from '@/lib/cn';
import type { ComboboxOption, ComboboxSourceKey } from '@/lib/combobox-sources';

const EMPTY_OPTION_VALUE = '__empty__';

export type AsyncComboboxProps = {
  source: ComboboxSourceKey;
  value: ComboboxOption[];
  onChange: (value: ComboboxOption[]) => void;
  multiple?: boolean;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyOption?: string;
  excludeValues?: string[];
  disabled?: boolean;
  invalid?: boolean;
  onBlur?: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
};

export function AsyncCombobox({
  source,
  value,
  onChange,
  multiple = false,
  id,
  placeholder = 'Selecione',
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Nenhum resultado encontrado.',
  emptyOption,
  excludeValues = [],
  disabled,
  invalid,
  onBlur,
  triggerRef,
}: AsyncComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const listId = useId();
  const { data, isFetching, isError } = useComboboxSearch(source, search, isOpen);
  const selectedValues = value.map((option) => option.value);
  const options = (data ?? []).filter((option) => !excludeValues.includes(option.value));

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setSearch('');
      onBlur?.();
    }
  }

  function select(option: ComboboxOption) {
    if (!multiple) {
      onChange([option]);
      handleOpenChange(false);
      return;
    }

    onChange(
      selectedValues.includes(option.value)
        ? value.filter((selected) => selected.value !== option.value)
        : [...value, option],
    );
  }

  function renderValue() {
    if (value.length === 0) {
      return <span className='truncate text-muted-foreground'>{emptyOption ?? placeholder}</span>;
    }

    return multiple ? (
      <BadgeList labels={value.map((option) => option.label)} />
    ) : (
      <span className='truncate'>{value[0].label}</span>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          id={id}
          type='button'
          role='combobox'
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-invalid={invalid}
          disabled={disabled}
          className='flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent py-1.5 pr-2 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50'
        >
          {renderValue()}
          <ChevronsUpDownIcon className='pointer-events-none size-4 shrink-0 text-muted-foreground' />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        align='start'
        className='w-(--radix-popover-trigger-width) min-w-64 gap-0 p-0'
      >
        <Command shouldFilter={false}>
          <div className='relative'>
            <CommandInput value={search} onValueChange={setSearch} placeholder={searchPlaceholder} />
            {isFetching && (
              <span className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'>
                <Spinner />
              </span>
            )}
          </div>
          <CommandList>
            {isError ? (
              <p role='alert' className='px-2 py-6 text-center text-sm text-destructive'>
                Não foi possível buscar agora. Tente novamente.
              </p>
            ) : (
              <CommandEmpty>{data ? emptyMessage : 'Buscando…'}</CommandEmpty>
            )}
            {(options.length > 0 || emptyOption) && (
              <CommandGroup>
                {emptyOption && (
                  <CommandItem
                    value={EMPTY_OPTION_VALUE}
                    onSelect={() => {
                      onChange([]);
                      handleOpenChange(false);
                    }}
                  >
                    <CheckIcon className={cn(value.length === 0 ? 'opacity-100' : 'opacity-0')} />
                    {emptyOption}
                  </CommandItem>
                )}
                {options.map((option) => (
                  <CommandItem key={option.value} value={option.value} onSelect={() => select(option)}>
                    <CheckIcon
                      className={cn(
                        selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className='min-w-0'>
                      <span className='block truncate'>{option.label}</span>
                      {option.description && (
                        <span className='block truncate text-xs text-muted-foreground'>
                          {option.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
