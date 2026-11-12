import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  labelAction?: ReactNode;
  trailing?: ReactNode;
};

export function TextField({
  label,
  error,
  hint,
  icon,
  labelAction,
  trailing,
  id,
  className,
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;
  const descriptionId = error || hint ? `${inputId}-description` : undefined;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-3'>
        <label htmlFor={inputId} className='text-sm font-semibold text-slate-700'>
          {label}
        </label>
        {labelAction}
      </div>

      <div className='group relative'>
        {icon && (
          <span
            className={cn(
              'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors',
              error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-brand-600',
            )}
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          className={cn(
            'h-12 w-full rounded-xl border bg-white text-[15px] text-slate-900 shadow-sm shadow-slate-900/[0.03] outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50',
            icon ? 'pl-11' : 'pl-4',
            trailing ? 'pr-12' : 'pr-4',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
              : 'border-slate-200 hover:border-brand-300 focus:border-brand-500 focus:ring-brand-500/15',
            className,
          )}
          {...props}
        />

        {trailing && (
          <span className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center'>
            {trailing}
          </span>
        )}
      </div>

      {error ? (
        <p id={descriptionId} className='text-[13px] font-medium text-red-600'>
          {error}
        </p>
      ) : (
        hint && (
          <p id={descriptionId} className='text-[13px] text-slate-500'>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
