'use client';

import type { ComponentProps, ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import { FormLabel } from './form-label';

type FormTextareaProps<TValues extends FieldValues, TContext, TTransformed> = Omit<
  ComponentProps<'textarea'>,
  'className' | 'defaultValue' | 'id' | 'name' | 'onBlur' | 'onChange' | 'ref' | 'value'
> & {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  description?: ReactNode;
  className?: string;
};

export function FormTextarea<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  required,
  description,
  className,
  ...textareaProps
}: FormTextareaProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, ...field }, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FormLabel htmlFor={field.name} label={label} required={required} />
          <Textarea
            {...field}
            {...textareaProps}
            value={value as string}
            id={field.name}
            required={required}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
