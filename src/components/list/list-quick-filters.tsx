import Link from 'next/link';

import { cn } from '@/lib/cn';
import type { FilterOption } from '@/lib/list-filters';
import { buildListHref } from '@/lib/list-params';

type ListQuickFiltersProps = {
  label: string;
  param: string;
  options: FilterOption[];
  pathname: string;
  query: Record<string, string>;
  pageSize: number;
  allLabel?: string;
};

export function ListQuickFilters({
  label,
  param,
  options,
  pathname,
  query,
  pageSize,
  allLabel = 'Todas',
}: ListQuickFiltersProps) {
  const current = query[param] ?? '';

  return (
    <nav aria-label={label} className='flex flex-wrap gap-2 animate-fade-up [animation-delay:40ms]'>
      {[{ value: '', label: allLabel }, ...options].map((option) => {
        const isActive = current === option.value;

        return (
          <Link
            key={option.value || 'all'}
            href={buildListHref(pathname, { ...query, [param]: option.value }, 1, pageSize)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
