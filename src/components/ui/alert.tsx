import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from './icons';

type AlertVariant = 'error' | 'warning' | 'success' | 'info';

const ALERT_STYLES: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
  info: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900 dark:bg-brand-950/60 dark:text-brand-100',
};

const ALERT_ICONS: Record<AlertVariant, ReactNode> = {
  error: <AlertCircleIcon className='size-5 shrink-0 text-red-500 dark:text-red-400' />,
  warning: (
    <TriangleAlert
      aria-hidden='true'
      strokeWidth={1.8}
      className='size-5 shrink-0 text-amber-500 dark:text-amber-400'
    />
  ),
  success: <CheckCircleIcon className='size-5 shrink-0 text-emerald-500 dark:text-emerald-400' />,
  info: <InfoIcon className='size-5 shrink-0 text-brand-600 dark:text-brand-300' />,
};

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed animate-fade-up',
        ALERT_STYLES[variant],
        className,
      )}
    >
      {ALERT_ICONS[variant]}
      <div className='flex flex-col gap-0.5'>
        {title && <p className='font-semibold'>{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
