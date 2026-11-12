import Link from 'next/link';
import type { ReactNode } from 'react';

export type BarListItem = {
  key: string;
  label: string;
  value: number;
  href?: string;
};

type BarListProps = {
  label: string;
  items: BarListItem[];
  emptyMessage: string;
  formatValue?: (value: number) => string;
};

const BAR_MIN_WIDTH = '4px';

export function BarList({ label, items, emptyMessage, formatValue = String }: BarListProps) {
  if (items.length === 0) {
    return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
  }

  const max = Math.max(...items.map((item) => item.value));

  return (
    <ul aria-label={label} className='flex flex-col gap-1'>
      {items.map((item) => {
        const share = max > 0 ? (item.value / max) * 100 : 0;
        const content: ReactNode = (
          <>
            <span className='flex items-baseline justify-between gap-3 text-sm'>
              <span className='min-w-0 truncate text-foreground'>{item.label}</span>
              <span className='shrink-0 font-medium text-foreground tabular-nums'>
                {formatValue(item.value)}
              </span>
            </span>
            <span
              aria-hidden='true'
              className='mt-1.5 block h-2 rounded-r-[4px] bg-primary'
              style={{ width: item.value > 0 ? `max(${share}%, ${BAR_MIN_WIDTH})` : 0 }}
            />
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
