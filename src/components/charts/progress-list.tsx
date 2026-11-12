import Link from 'next/link';
import type { ReactNode } from 'react';

import { ProgressMeter } from './progress-meter';

export type ProgressListItem = {
  key: string;
  label: string;
  value: number;
  max: number;
  valueText: string;
  description?: string;
  href?: string;
};

type ProgressListProps = {
  label: string;
  items: ProgressListItem[];
  emptyMessage: string;
};

export function ProgressList({ label, items, emptyMessage }: ProgressListProps) {
  if (items.length === 0) {
    return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
  }

  return (
    <ul aria-label={label} className='grid gap-x-8 gap-y-1 md:grid-cols-2'>
      {items.map((item) => {
        const content: ReactNode = (
          <>
            <ProgressMeter
              label={item.label}
              valueText={item.valueText}
              value={item.value}
              max={item.max}
            />
            {item.description && (
              <span className='mt-1 block text-xs text-muted-foreground'>{item.description}</span>
            )}
          </>
        );

        return (
          <li key={item.key}>
            {item.href ? (
              <Link
                href={item.href}
                className='-mx-2 block rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50'
              >
                {content}
              </Link>
            ) : (
              <div className='py-1.5'>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
