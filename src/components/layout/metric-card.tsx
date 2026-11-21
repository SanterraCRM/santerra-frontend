import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
};

const CARD_CLASS =
  'group @container flex h-full flex-col gap-4 rounded-xl bg-card p-4 text-card-foreground shadow-xs ring-1 ring-foreground/10 animate-fade-up [animation-delay:80ms] sm:p-5';

export function MetricCard({ label, value, description, icon: Icon, href }: MetricCardProps) {
  const content: ReactNode = (
    <>
      <span className='flex items-start justify-between gap-2'>
        <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-200 group-hover:scale-105 dark:bg-brand-950 dark:text-brand-300'>
          <Icon className='size-5' />
        </span>
        {href && (
          <ArrowUpRight
            aria-hidden='true'
            className='size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-300'
          />
        )}
      </span>
      <span className='flex flex-col gap-1'>
        <span className='text-sm text-muted-foreground'>{label}</span>
        <span className='text-[clamp(1.25rem,12cqi,1.875rem)] leading-tight font-semibold tracking-tight wrap-break-word text-foreground'>
          {value}
        </span>
        {description && <span className='text-xs text-muted-foreground'>{description}</span>}
      </span>
    </>
  );

  if (!href) {
    return <div className={CARD_CLASS}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        CARD_CLASS,
        'outline-none transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-300 focus-visible:ring-3 focus-visible:ring-ring/50 dark:hover:ring-brand-800',
      )}
    >
      {content}
    </Link>
  );
}
