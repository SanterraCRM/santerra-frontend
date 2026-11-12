'use client';

import type { LucideIcon } from 'lucide-react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { RequiredMark } from './required-mark';

type RadioCardOption = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type FormRadioCardsProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  options: RadioCardOption[];
  required?: boolean;
};

export function FormRadioCards<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  options,
  required = false,
}: FormRadioCardsProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldSet data-invalid={fieldState.invalid} className='gap-3'>
          <FieldLegend variant='label'>
            {label}
            {required && (
              <>
                {' '}
                <RequiredMark />
              </>
            )}
          </FieldLegend>
          <RadioGroup
            name={field.name}
            value={(field.value as string | undefined) ?? ''}
            onValueChange={field.onChange}
            aria-required={required}
            aria-invalid={fieldState.invalid}
            className='sm:grid-cols-2'
          >
            {options.map(({ value, label: optionLabel, description, icon: Icon }) => (
              <FieldLabel key={value} htmlFor={`${field.name}-${value}`}>
                <Field orientation='horizontal'>
                  <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'>
                    <Icon className='size-4' />
                  </span>
                  <FieldContent>
                    <FieldTitle>{optionLabel}</FieldTitle>
                    <FieldDescription>{description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    id={`${field.name}-${value}`}
                    value={value}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </FieldSet>
      )}
    />
  );
}
