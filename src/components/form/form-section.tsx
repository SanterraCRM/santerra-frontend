import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type FormSectionProps = {
  title: string;
  description?: string;
  columns?: 1 | 2;
  children: ReactNode;
};

export function FormSection({ title, description, columns = 2, children }: FormSectionProps) {
  return (
    <section className='flex flex-col gap-4 border-t pt-6 first:border-t-0 first:pt-0'>
      <div className='flex flex-col gap-1'>
        <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
        {description && <p className='text-sm text-muted-foreground'>{description}</p>}
      </div>
      <div className={cn('grid gap-5', columns === 2 && 'sm:grid-cols-2')}>{children}</div>
    </section>
  );
}
