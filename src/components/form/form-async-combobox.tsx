'use client';

import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import type { ComboboxOption } from '@/lib/combobox-sources';

import { AsyncCombobox, type AsyncComboboxProps } from './async-combobox';
import { FormLabel } from './form-label';

type FormAsyncComboboxProps<TValues extends FieldValues, TContext, TTransformed> = Pick<
  AsyncComboboxProps,
  'source' | 'multiple' | 'placeholder' | 'searchPlaceholder' | 'emptyMessage' | 'excludeValues' | 'disabled'
> & {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  description?: ReactNode;
  onValueChange?: (value: ComboboxOption[]) => void;
  className?: string;
};

export function FormAsyncCombobox<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  required,
  description,
  multiple = false,
  onValueChange,
  className,
  ...comboboxProps
}: FormAsyncComboboxProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = multiple
          ? ((field.value as ComboboxOption[] | undefined) ?? [])
          : [field.value as ComboboxOption | null].filter((option) => option !== null && option !== undefined);

        function handleChange(next: ComboboxOption[]) {
          field.onChange(multiple ? next : (next[0] ?? null));
          onValueChange?.(next);
        }

        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FormLabel htmlFor={field.name} label={label} required={required} />
            <AsyncCombobox
              {...comboboxProps}
              id={field.name}
              multiple={multiple}
              value={value}
              onChange={handleChange}
              onBlur={field.onBlur}
              triggerRef={field.ref}
              invalid={fieldState.invalid}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
