import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { StatusBadge, type StatusTone } from '@/components/list/status-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type RelatedRecord = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  status?: { label: string; tone: StatusTone };
  value?: string;
};

type RelatedRecordsProps = {
  title: string;
  description?: string;
  records: RelatedRecord[];
  total: number;
  emptyMessage: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function RelatedRecords({
  title,
  description,
  records,
  total,
  emptyMessage,
  viewAllHref,
  viewAllLabel = 'Ver todos',
}: RelatedRecordsProps) {
  return (
    <Card className='animate-fade-up [animation-delay:120ms]'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {viewAllHref && total > 0 && (
          <CardAction>
            <Button href={viewAllHref} variant='outline' size='sm'>
              {viewAllLabel} ({total})
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        {records.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{emptyMessage}</p>
        ) : (
          <ul className='flex flex-col divide-y rounded-lg border'>
            {records.map((record) => (
              <li key={record.id}>
                <Link
                  href={record.href}
                  className='flex items-center gap-3 px-3 py-2.5 outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50'
                >
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
        )}
      </CardContent>
    </Card>
  );
}
