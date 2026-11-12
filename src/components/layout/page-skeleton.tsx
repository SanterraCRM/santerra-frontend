'use client';

import { usePathname } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

import { PageHeaderSkeleton } from './page-header';

const RECORD_SEGMENT = /^(new|[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12})$/i;

const LIST_COLUMNS = [
  'hidden h-4 w-28 sm:block',
  'hidden h-4 w-28 md:block',
  'hidden h-4 w-20 lg:block',
];

const FORM_FIELDS = ['sm:col-span-2', '', '', 'sm:col-span-2'];

type PageSkeletonProps = {
  variant?: 'list' | 'form';
};

function ListSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeaderSkeleton hasActions hasSearch />

      <div className='overflow-hidden rounded-xl border bg-card'>
        <div className='h-10 border-b bg-muted/50' />
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className='flex items-center gap-3 border-b px-4 py-3'>
            <div className='flex flex-1 flex-col gap-1.5'>
              <Skeleton className='h-4 w-44 max-w-full' />
              <Skeleton className='h-3 w-56 max-w-full' />
            </div>
            {LIST_COLUMNS.map((className) => (
              <Skeleton key={className} className={className} />
            ))}
            <Skeleton className='mr-2 ml-4 size-8' />
          </div>
        ))}
        <div className='grid grid-cols-2 items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_1fr]'>
          <Skeleton className='h-8 w-36' />
          <Skeleton className='col-span-2 row-start-1 h-9 w-72 max-w-full justify-self-center sm:col-span-1 sm:col-start-2' />
          <Skeleton className='h-5 w-24 justify-self-end' />
        </div>
      </div>
    </div>
  );
}

type FormSkeletonProps = {
  hasActions: boolean;
};

function FormSkeleton({ hasActions }: FormSkeletonProps) {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <Skeleton className='h-5 w-20' />
      <PageHeaderSkeleton hasActions={hasActions} />

      <div className='rounded-xl border bg-card p-6'>
        <Skeleton className='h-5 w-36' />
        <Skeleton className='mt-2 h-4 w-60 max-w-full' />

        <div className='mt-6 grid gap-5 sm:grid-cols-2'>
          {FORM_FIELDS.map((span, index) => (
            <div key={index} className={cn('flex flex-col gap-2', span)}>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-9 w-full' />
            </div>
          ))}
        </div>

        <div className='mt-6 flex justify-end gap-2 border-t pt-6'>
          <Skeleton className='h-9 w-28' />
          <Skeleton className='h-9 w-36' />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ variant }: PageSkeletonProps) {
  const pathname = usePathname();
  const lastSegment = pathname.split('/').pop() ?? '';
  const isForm = variant ? variant === 'form' : RECORD_SEGMENT.test(lastSegment);

  return isForm ? <FormSkeleton hasActions={lastSegment !== 'new'} /> : <ListSkeleton />;
}
