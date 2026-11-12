import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ListSearch } from '@/components/list/list-search';
import { Skeleton } from '@/components/ui/skeleton';

export type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  searchPlaceholder?: string;
  filters?: ReactNode;
};

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  searchPlaceholder,
  filters,
}: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 animate-fade-up'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'>
            <Icon className='size-5' />
          </div>
          <div className='min-w-0'>
            <h1 className='text-lg leading-tight font-semibold text-balance wrap-break-word text-foreground'>
              {title}
            </h1>
            {description && <p className='mt-0.5 text-sm text-muted-foreground'>{description}</p>}
          </div>
        </div>

        {actions && <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div>}
      </div>

      {(searchPlaceholder || filters) && (
        <div className='flex items-center justify-end gap-2'>
          {searchPlaceholder && <ListSearch placeholder={searchPlaceholder} />}
          {filters}
        </div>
      )}
    </div>
  );
}

type PageHeaderSkeletonProps = {
  hasActions?: boolean;
  hasSearch?: boolean;
};

export function PageHeaderSkeleton({ hasActions = false, hasSearch = false }: PageHeaderSkeletonProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <Skeleton className='size-10 shrink-0 rounded-lg' />
          <div className='flex min-w-0 flex-col gap-1.5'>
            <Skeleton className='h-5 w-36' />
            <Skeleton className='h-4 w-72 max-w-full' />
          </div>
        </div>
        {hasActions && <Skeleton className='h-9 w-32' />}
      </div>

      {hasSearch && (
        <div className='flex gap-2'>
          <Skeleton className='h-9 flex-1' />
          <Skeleton className='h-9 w-24' />
        </div>
      )}
    </div>
  );
}
