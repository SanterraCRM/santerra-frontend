'use client';

import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { MoneyInput } from '@/components/ui/money-input';

import { FormLabel } from './form-label';

type FormMoneyInputProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  description?: ReactNode;
  className?: string;
};

export function FormMoneyInput<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  required,
  disabled,
  description,
  className,
}: FormMoneyInputProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FormLabel htmlFor={field.name} label={label} required={required} />
          <MoneyInput
            {...field}
            id={field.name}
            value={value as string}
            onValueChange={onChange}
            required={required}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
