'use client';

import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { BadgeList } from '@/components/list/badge-list';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import type { ComboboxOption } from '@/lib/combobox-sources';

const EMPTY_OPTION_VALUE = '__empty__';
const END_REACHED_OFFSET = 48;

type SelectionMarkProps = {
  multiple: boolean;
  isSelected: boolean;
};

function SelectionMark({ multiple, isSelected }: SelectionMarkProps) {
  if (!multiple) {
    return <CheckIcon className={cn(isSelected ? 'opacity-100' : 'opacity-0')} />;
  }

  return (
    <span
      aria-hidden='true'
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs dark:bg-input/30',
        isSelected && 'border-primary bg-primary text-primary-foreground dark:bg-primary',
      )}
    >
      {isSelected && <CheckIcon className='size-3.5 text-current' />}
    </span>
  );
}

export type ComboboxSearch = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  isLoading?: boolean;
};

export type ComboboxPopoverProps = {
  id?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  options: ComboboxOption[];
  selected: ComboboxOption[];
  multiple?: boolean;
  onSelect: (option: ComboboxOption) => void;
  emptyOption?: string;
  onClear: () => void;
  placeholder: string;
  search?: ComboboxSearch;
  message: ReactNode;
  footer?: ReactNode;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  triggerRef?: Ref<HTMLButtonElement>;
  trigger?: ReactElement;
  side?: 'bottom' | 'right';
};

export function ComboboxPopover({
  id,
  isOpen,
  onOpenChange,
  options,
  selected,
  multiple = false,
  onSelect,
  emptyOption,
  onClear,
  placeholder,
  search,
  message,
  footer,
  isLoadingMore = false,
  onEndReached,
  disabled,
  invalid,
  triggerRef,
  trigger,
  side = 'bottom',
}: ComboboxPopoverProps) {
  const contentId = useId();
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeValue, setActiveValue] = useState('');
  const selectedValues = selected.map((option) => option.value);
  const optionValues = options.map((option) => option.value);
  const showsEmptyOption = Boolean(emptyOption) && !search?.value.trim();
  const itemValues = showsEmptyOption ? [EMPTY_OPTION_VALUE, ...optionValues] : optionValues;
  const highlightedValue = itemValues.includes(activeValue) ? activeValue : (itemValues[0] ?? '');
  const lastValue = optionValues.at(-1);

  useEffect(() => {
    const list = listRef.current;

    if (isOpen && list && list.scrollHeight <= list.clientHeight) {
      onEndReached?.();
    }
  }, [isOpen, options, onEndReached]);

  function getInitialActiveValue(): string {
    const current = selectedValues.find((value) => optionValues.includes(value));

    if (current) {
      return current;
    }

    return emptyOption && selected.length === 0 ? EMPTY_OPTION_VALUE : '';
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setActiveValue(getInitialActiveValue());
    }

    onOpenChange(open);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      handleOpenChange(true);
    }
  }

  function handleOpenAutoFocus(event: Event) {
    event.preventDefault();
    (inputRef.current ?? commandRef.current)?.focus();
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[cmdk-item][aria-selected="true"]')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  function handleActiveValueChange(value: string) {
    setActiveValue(value);

    if (value && value === lastValue) {
      onEndReached?.();
    }
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;

    if (list.scrollTop + list.clientHeight >= list.scrollHeight - END_REACHED_OFFSET) {
      onEndReached?.();
    }
  }

  function renderValue() {
    if (selected.length === 0) {
      return <span className='truncate text-muted-foreground'>{emptyOption ?? placeholder}</span>;
    }

    return multiple ? (
      <BadgeList labels={selected.map((option) => option.label)} />
    ) : (
      <span className='truncate'>{selected[0].label}</span>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        asChild
        role='combobox'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-invalid={invalid}
        disabled={disabled}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger ?? (
          <button
            ref={triggerRef}
            id={id}
            type='button'
            className='flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent py-1.5 pr-2 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'
          >
            {renderValue()}
            <ChevronDownIcon className='pointer-events-none size-4 shrink-0 text-muted-foreground' />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        id={contentId}
        align='start'
        side={side}
        onOpenAutoFocus={handleOpenAutoFocus}
        className='w-(--radix-popover-trigger-width) min-w-64 gap-0 p-0'
      >
        <Command
          ref={commandRef}
          shouldFilter={false}
          value={highlightedValue}
          onValueChange={handleActiveValueChange}
          className='outline-none'
        >
          {search && (
            <div className='relative'>
              <CommandInput
                ref={inputRef}
                value={search.value}
                onValueChange={search.onValueChange}
                placeholder={search.placeholder}
              />
              {search.isLoading && (
                <span className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'>
                  <Spinner />
                </span>
              )}
            </div>
          )}
          <CommandList
            ref={listRef}
            onScroll={handleScroll}
            aria-multiselectable={multiple || undefined}
          >
            {itemValues.length > 0 && (
              <CommandGroup>
                {showsEmptyOption && (
                  <CommandItem value={EMPTY_OPTION_VALUE} onSelect={onClear}>
                    <SelectionMark multiple={false} isSelected={selected.length === 0} />
                    {emptyOption}
                  </CommandItem>
                )}
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => onSelect(option)}
                      aria-checked={multiple ? isSelected : undefined}
                    >
                      <SelectionMark multiple={multiple} isSelected={isSelected} />
                      {option.icon}
                      <span className='min-w-0'>
                        <span className='block truncate'>{option.label}</span>
                        {option.description && (
                          <span className='block truncate text-xs text-muted-foreground'>
                            {option.description}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {options.length === 0 && (
              <div className='px-2 py-6 text-center text-sm text-muted-foreground'>{message}</div>
            )}
            {isLoadingMore && (
              <div className='flex items-center justify-center gap-2 px-2 py-3 text-xs text-muted-foreground'>
                <Spinner />
                Carregando mais…
              </div>
            )}
          </CommandList>
          {footer && (
            <p className='border-t px-3 py-2 text-xs text-muted-foreground'>{footer}</p>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
