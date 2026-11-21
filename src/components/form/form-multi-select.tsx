'use client';

import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import type { ComboboxOption } from '@/lib/combobox-sources';

import { Combobox } from './combobox';
import { FormLabel } from './form-label';

export type FormMultiSelectOption = Pick<ComboboxOption, 'value' | 'label' | 'description' | 'disabled'>;

type FormMultiSelectProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  options: FormMultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
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
  searchPlaceholder,
  emptyMessage = 'Nenhuma opção disponível.',
  required,
  disabled,
  description,
  className,
}: FormMultiSelectProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FormLabel htmlFor={field.name} label={label} required={required} />
          <Combobox
            id={field.name}
            multiple
            options={options}
            value={(field.value as string[] | undefined) ?? []}
            onChange={field.onChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            disabled={disabled}
            invalid={fieldState.invalid}
            onBlur={field.onBlur}
            triggerRef={field.ref}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
