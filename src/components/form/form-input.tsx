'use client';

import type { ComponentProps, ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { FormLabel } from './form-label';

type FormInputProps<TValues extends FieldValues, TContext, TTransformed> = Omit<
  ComponentProps<'input'>,
  'className' | 'defaultValue' | 'id' | 'name' | 'onBlur' | 'onChange' | 'ref' | 'value'
> & {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  description?: ReactNode;
  mask?: (value: string) => string;
  className?: string;
};

export function FormInput<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  required,
  description,
  mask,
  className,
  ...inputProps
}: FormInputProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FormLabel htmlFor={field.name} label={label} required={required} />
          <Input
            {...field}
            {...inputProps}
            value={value as string}
            id={field.name}
            required={required}
            aria-invalid={fieldState.invalid}
            onChange={(event) => onChange(mask ? mask(event.target.value) : event.target.value)}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
