import Link from 'next/link';
import type { ReactNode } from 'react';

import type { StatusTone } from '@/components/list/status-badge';
import { cn } from '@/lib/cn';

export type SegmentedBarItem = {
  key: string;
  label: string;
  value: number;
  tone: StatusTone;
  href?: string;
};

type SegmentedBarProps = {
  label: string;
  items: SegmentedBarItem[];
  formatValue?: (value: number) => string;
};

const TONE_FILL: Record<StatusTone, string> = {
  success: 'bg-emerald-500 dark:bg-emerald-400',
  info: 'bg-brand-500 dark:bg-brand-400',
  warning: 'bg-amber-400 dark:bg-amber-300',
  neutral: 'bg-muted-foreground/40',
};

export function SegmentedBar({ label, items, formatValue = String }: SegmentedBarProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const summary = items.map((item) => `${item.label}: ${formatValue(item.value)}`).join(', ');

  return (
    <div className='flex flex-col gap-3'>
      <div
        role='img'
        aria-label={`${label}. ${summary}`}
        className='flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted'
      >
        {items
          .filter((item) => item.value > 0)
          .map((item) => (
            <span
              key={item.key}
              className={cn('h-full', TONE_FILL[item.tone])}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          ))}
      </div>

      <ul aria-label={label} className='flex flex-wrap gap-x-4 gap-y-1'>
        {items.map((item) => {
          const content: ReactNode = (
            <>
              <span aria-hidden='true' className={cn('size-2.5 rounded-full', TONE_FILL[item.tone])} />
              <span className='text-muted-foreground'>{item.label}</span>
              <span className='font-medium text-foreground tabular-nums'>
                {formatValue(item.value)}
              </span>
            </>
          );

          return (
            <li key={item.key}>
              {item.href ? (
                <Link
                  href={item.href}
                  className='-mx-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50'
                >
                  {content}
                </Link>
              ) : (
                <span className='inline-flex items-center gap-1.5 py-0.5 text-sm'>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
