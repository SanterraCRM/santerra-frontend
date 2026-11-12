import { FieldLabel } from '@/components/ui/field';

import { RequiredMark } from './required-mark';

type FormLabelProps = {
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function FormLabel({ htmlFor, label, required = false }: FormLabelProps) {
  return (
    <FieldLabel htmlFor={htmlFor}>
      {required ? (
        <span>
          {label}{' '}
          <RequiredMark />
        </span>
      ) : (
        label
      )}
    </FieldLabel>
  );
}
