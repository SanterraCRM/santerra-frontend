import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function StatCard({ label, value, description, icon: Icon, action }: StatCardProps) {
  return (
    <Card className='h-full animate-fade-up [animation-delay:80ms]'>
      <CardContent className='flex-row flex-wrap items-center justify-between gap-4'>
        <div className='flex min-w-0 items-center gap-4'>
          {Icon && (
            <span className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'>
              <Icon className='size-5' />
            </span>
          )}
          <div className='min-w-0'>
            <p className='text-sm text-muted-foreground'>{label}</p>
            <p className='truncate text-2xl font-semibold tracking-tight text-foreground'>
              {value}
            </p>
            {description && <p className='text-xs text-muted-foreground'>{description}</p>}
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
