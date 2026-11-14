'use client';

import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field } from '@/components/ui/field';

import { CompanyLogoInput } from './company-logo-input';
import { FormLabel } from './form-label';

type FormCompanyLogoInputProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  disabled?: boolean;
  className?: string;
};

export function FormCompanyLogoInput<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  disabled,
  className,
}: FormCompanyLogoInputProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field className={className}>
          <FormLabel htmlFor={field.name} label={label} />
          <CompanyLogoInput
            id={field.name}
            value={(field.value as File | null) ?? null}
            onChange={field.onChange}
            disabled={disabled}
          />
        </Field>
      )}
    />
  );
}
