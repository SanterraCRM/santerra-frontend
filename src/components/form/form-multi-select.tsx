'use client';

import { ChevronDownIcon } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { BadgeList } from '@/components/list/badge-list';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { FormLabel } from './form-label';

export type FormMultiSelectOption = {
  value: string;
  label: string;
};

type FormMultiSelectProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  options: FormMultiSelectOption[];
  placeholder?: string;
  emptyMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  description?: ReactNode;
  className?: string;
};

export function FormMultiSelect<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  options,
  placeholder = 'Selecione',
  emptyMessage = 'Nenhuma opção disponível.',
  required,
  disabled,
  description,
  className,
}: FormMultiSelectProps<TValues, TContext, TTransformed>) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected = (field.value as string[] | undefined) ?? [];
        const selectedLabels = options
          .filter((option) => selected.includes(option.value))
          .map((option) => option.label);

        function toggle(value: string, checked: boolean) {
          const next = options
            .map((option) => option.value)
            .filter((option) => (option === value ? checked : selected.includes(option)));

          field.onChange(next);
        }

        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FormLabel htmlFor={field.name} label={label} required={required} />
            <Popover
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);

                if (!open) {
                  field.onBlur();
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  ref={field.ref}
                  id={field.name}
                  type='button'
                  role='combobox'
                  disabled={disabled}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  aria-invalid={fieldState.invalid}
                  className='flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent py-1.5 pr-2 pl-2.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50'
                >
                  {selectedLabels.length > 0 ? (
                    <BadgeList labels={selectedLabels} />
                  ) : (
                    <span className='text-muted-foreground'>{placeholder}</span>
                  )}
                  <ChevronDownIcon className='pointer-events-none size-4 shrink-0 text-muted-foreground' />
                </button>
              </PopoverTrigger>
              <PopoverContent
                id={contentId}
                align='start'
                className='max-h-72 w-(--radix-popover-trigger-width) gap-0 overflow-y-auto p-1'
              >
                {options.length === 0 ? (
                  <p className='px-2 py-1.5 text-muted-foreground'>{emptyMessage}</p>
                ) : (
                  <div role='group' aria-label={label}>
                    {options.map((option) => {
                      const id = `${field.name}-${option.value}`;

                      return (
                        <label
                          key={option.value}
                          htmlFor={id}
                          className='flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground has-focus-visible:bg-accent'
                        >
                          <Checkbox
                            id={id}
                            checked={selected.includes(option.value)}
                            onCheckedChange={(checked) => toggle(option.value, checked === true)}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
