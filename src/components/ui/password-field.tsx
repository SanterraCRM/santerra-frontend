'use client';

import { type ComponentProps, useState } from 'react';

import { EyeIcon, EyeOffIcon, LockIcon } from './icons';
import { TextField } from './text-field';

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>;

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      icon={<LockIcon />}
      {...props}
      type={isVisible ? 'text' : 'password'}
      trailing={
        <button
          type='button'
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
          className='flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
