'use client';

import { type Ref, useState } from 'react';

import { useComboboxSearch } from '@/hooks/use-combobox-search';
import type { ComboboxOption, ComboboxSourceKey } from '@/lib/combobox-sources';

import { ComboboxPopover } from './combobox-popover';

const countFormatter = new Intl.NumberFormat('pt-BR');

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
  placeholder = 'Selecione',
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Nenhum resultado encontrado.',
  emptyOption,
  excludeValues = [],
  onBlur,
  ...props
}: AsyncComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const {
    options,
    total,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
  } = useComboboxSearch(source, search, isOpen);
  const selectedValues = value.map((option) => option.value);
  const visibleOptions = options.filter((option) => !excludeValues.includes(option.value));

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

  function clear() {
    onChange([]);
    handleOpenChange(false);
  }

  function loadMore() {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }

  function getMessage() {
    if (isError && !isFetchNextPageError) {
      return (
        <span role='alert' className='text-destructive'>
          Não foi possível buscar agora. Tente novamente.
        </span>
      );
    }

    return isPending ? 'Buscando…' : emptyMessage;
  }

  function getFooter() {
    if (isFetchNextPageError) {
      return 'Não foi possível carregar mais resultados. Role de novo para tentar.';
    }

    if (!hasNextPage) {
      return null;
    }

    return `Mostrando ${countFormatter.format(options.length)} de ${countFormatter.format(total)}. Role para ver mais ou refine a busca.`;
  }

  return (
    <ComboboxPopover
      {...props}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      options={visibleOptions}
      selected={value}
      multiple={multiple}
      onSelect={select}
      emptyOption={emptyOption}
      onClear={clear}
      placeholder={placeholder}
      search={{
        value: search,
        onValueChange: setSearch,
        placeholder: searchPlaceholder,
        isLoading: isFetching && !isFetchingNextPage,
      }}
      message={getMessage()}
      footer={getFooter()}
      isLoadingMore={isFetchingNextPage}
      onEndReached={loadMore}
    />
  );
}
