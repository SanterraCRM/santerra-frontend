'use client';

import { type ReactElement, type ReactNode, type Ref, useState } from 'react';

import type { ComboboxOption } from '@/lib/combobox-sources';

import { ComboboxPopover } from './combobox-popover';

const MAX_OPTIONS_WITHOUT_SEARCH = 10;
const DIACRITICS_PATTERN = /[̀-ͯ]/g;

export function hasSearchableSize(optionsCount: number): boolean {
  return optionsCount > MAX_OPTIONS_WITHOUT_SEARCH;
}

function normalizeSearchText(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS_PATTERN, '').toLocaleLowerCase('pt-BR').trim();
}

function filterOptions(options: ComboboxOption[], search: string): ComboboxOption[] {
  const term = normalizeSearchText(search);

  if (!term) {
    return options;
  }

  return options.filter((option) =>
    normalizeSearchText(`${option.label} ${option.description ?? ''}`).includes(term),
  );
}

export type ComboboxProps = {
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  emptyOption?: string;
  disabled?: boolean;
  invalid?: boolean;
  onBlur?: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
  trigger?: ReactElement;
  side?: 'bottom' | 'right';
};

export function Combobox({
  options,
  value,
  onChange,
  multiple = false,
  searchable = hasSearchableSize(options.length),
  placeholder = 'Selecione',
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Nenhuma opção disponível.',
  emptyOption,
  onBlur,
  ...props
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.filter((option) => value.includes(option.value));
  const visibleOptions = searchable ? filterOptions(options, search) : options;

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setSearch('');
      onBlur?.();
    }
  }

  function select(option: ComboboxOption) {
    if (!multiple) {
      onChange([option.value]);
      handleOpenChange(false);
      return;
    }

    const next = value.includes(option.value)
      ? value.filter((selectedValue) => selectedValue !== option.value)
      : [...value, option.value];

    onChange(options.map((item) => item.value).filter((item) => next.includes(item)));
  }

  function clear() {
    onChange([]);
    handleOpenChange(false);
  }

  return (
    <ComboboxPopover
      {...props}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      options={visibleOptions}
      selected={selected}
      multiple={multiple}
      onSelect={select}
      emptyOption={emptyOption}
      onClear={clear}
      placeholder={placeholder}
      search={
        searchable
          ? { value: search, onValueChange: setSearch, placeholder: searchPlaceholder }
          : undefined
      }
      message={options.length > 0 ? 'Nenhum resultado encontrado.' : emptyMessage}
    />
  );
}
