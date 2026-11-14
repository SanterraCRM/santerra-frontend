import type { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className='flex flex-col gap-3 animate-fade-up sm:flex-row sm:items-end sm:justify-between'>
      <div className='min-w-0'>
        <h2 className='text-base leading-tight font-semibold text-foreground'>{title}</h2>
        {description && <p className='mt-0.5 text-sm text-muted-foreground'>{description}</p>}
      </div>
      {actions && <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div>}
    </div>
  );
}
