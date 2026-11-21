import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { StatusBadge, type StatusTone } from '@/components/list/status-badge';
import { formatDate, formatDateParts } from '@/lib/format';

export type RelatedRecord = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  status?: { label: string; tone: StatusTone };
  value?: string;
  date?: string | null;
};

type DateTileProps = {
  date: string | null;
};

function DateTile({ date }: DateTileProps) {
  if (!date) {
    return (
      <span className='flex w-11 shrink-0 items-center justify-center self-stretch rounded-lg border border-dashed text-center text-[11px] leading-tight text-muted-foreground'>
        Sem data
      </span>
    );
  }

  const { day, month } = formatDateParts(date);

  return (
    <time
      dateTime={date}
      className='flex w-11 shrink-0 flex-col items-center rounded-lg bg-brand-50 py-1.5 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900'
    >
      <span aria-hidden='true' className='text-[10px] leading-none font-medium tracking-wide uppercase'>
        {month}
      </span>
      <span aria-hidden='true' className='mt-1 text-base leading-none font-semibold tabular-nums'>
        {day}
      </span>
      <span className='sr-only'>{formatDate(date, 'long')}</span>
    </time>
  );
}

type RecordListProps = {
  records: RelatedRecord[];
  emptyMessage: string;
};

export function RecordList({ records, emptyMessage }: RecordListProps) {
  if (records.length === 0) {
    return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
  }

  return (
    <ul className='flex flex-col divide-y rounded-lg border'>
      {records.map((record) => (
        <li key={record.id}>
          <Link
            href={record.href}
            className='flex items-center gap-3 px-3 py-2.5 outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50'
          >
            {record.date !== undefined && <DateTile date={record.date} />}
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-sm font-medium text-foreground'>
                {record.title}
              </span>
              {record.subtitle && (
                <span className='block truncate text-xs text-muted-foreground'>
                  {record.subtitle}
                </span>
              )}
            </span>
            {record.status && <StatusBadge {...record.status} />}
            {record.value && (
              <span className='shrink-0 text-sm font-medium text-foreground tabular-nums'>
                {record.value}
              </span>
            )}
            <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
          </Link>
        </li>
      ))}
    </ul>
  );
}
