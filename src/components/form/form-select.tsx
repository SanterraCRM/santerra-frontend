'use client';

import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { FormLabel } from './form-label';

const EMPTY_OPTION_VALUE = '__empty__';

type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  options: FormSelectOption[];
  emptyOption?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  description?: ReactNode;
  className?: string;
};

export function FormSelect<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  options,
  emptyOption,
  required,
  placeholder,
  disabled,
  description,
  className,
}: FormSelectProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FormLabel htmlFor={field.name} label={label} required={required} />
          <Select
            name={field.name}
            value={(field.value as string) || (emptyOption ? EMPTY_OPTION_VALUE : '')}
            onValueChange={(value) => field.onChange(value === EMPTY_OPTION_VALUE ? '' : value)}
            disabled={disabled}
          >
            <SelectTrigger
              ref={field.ref}
              id={field.name}
              aria-invalid={fieldState.invalid}
              className='w-full'
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position='popper'>
              {emptyOption && <SelectItem value={EMPTY_OPTION_VALUE}>{emptyOption}</SelectItem>}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
