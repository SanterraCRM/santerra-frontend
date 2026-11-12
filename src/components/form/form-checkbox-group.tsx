'use client';

import type { ReactNode } from 'react';
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';

export type FormCheckboxOption = {
  value: string;
  label: string;
  description?: string | null;
  disabled?: boolean;
};

type FormCheckboxGroupProps<TValues extends FieldValues, TContext, TTransformed> = {
  control: Control<TValues, TContext, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  options: FormCheckboxOption[];
  description?: ReactNode;
  emptyMessage?: ReactNode;
  className?: string;
};

export function FormCheckboxGroup<TValues extends FieldValues, TContext, TTransformed>({
  control,
  name,
  label,
  options,
  description,
  emptyMessage,
  className,
}: FormCheckboxGroupProps<TValues, TContext, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected = (field.value as string[] | undefined) ?? [];

        function toggle(value: string, checked: boolean) {
          const next = options
            .map((option) => option.value)
            .filter((option) => (option === value ? checked : selected.includes(option)));

          field.onChange(next);
        }

        return (
          <FieldSet className={className} data-invalid={fieldState.invalid}>
            <FieldLegend variant='label'>{label}</FieldLegend>
            {description && <FieldDescription>{description}</FieldDescription>}

            {options.length === 0 ? (
              <p className='text-sm text-muted-foreground'>{emptyMessage}</p>
            ) : (
              <FieldGroup data-slot='checkbox-group' className='gap-3'>
                {options.map((option) => {
                  const id = `${field.name}-${option.value}`;

                  return (
                    <Field key={option.value} orientation='horizontal' data-disabled={option.disabled}>
                      <Checkbox
                        id={id}
                        checked={selected.includes(option.value)}
                        disabled={option.disabled}
                        onCheckedChange={(checked) => toggle(option.value, checked === true)}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={id} className='font-normal'>
                          {option.label}
                        </FieldLabel>
                        {option.description && (
                          <FieldDescription>{option.description}</FieldDescription>
                        )}
                      </FieldContent>
                    </Field>
                  );
                })}
              </FieldGroup>
            )}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        );
      }}
    />
  );
}
