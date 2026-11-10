import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';
import { maskMoney } from '@/lib/format';

import { Input } from './input';

type MoneyInputProps = Omit<ComponentProps<'input'>, 'type' | 'inputMode' | 'value' | 'onChange'> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function MoneyInput({
  value,
  onValueChange,
  className,
  placeholder = '0,00',
  ...props
}: MoneyInputProps) {
  return (
    <div className='relative'>
      <span className='pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground'>
        R$
      </span>
      <Input
        {...props}
        type='text'
        inputMode='numeric'
        autoComplete='off'
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(maskMoney(event.target.value))}
        className={cn('pl-9 tabular-nums', className)}
      />
    </div>
  );
}
