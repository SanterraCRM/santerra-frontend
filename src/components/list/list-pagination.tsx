import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { buildListHref } from '@/lib/list-params';
import type { PaginationMeta } from '@/types/api';

import { ListPageSize } from './list-page-size';

type PageItem = number | 'ellipsis';

function getPageItems(page: number, totalPages: number): PageItem[] {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((item, index) =>
    index > 0 && item - pages[index - 1] > 1 ? ['ellipsis' as const, item] : [item],
  );
}

function PaginationDivider() {
  return <li role='presentation' aria-hidden className='mx-0.5 h-5 w-px bg-border' />;
}

type ListPaginationProps = {
  pathname: string;
  query?: Record<string, string>;
  meta: PaginationMeta;
};

export function ListPagination({ pathname, query = {}, meta }: ListPaginationProps) {
  const { page, limit, total, totalPages } = meta;

  if (total === 0) {
    return null;
  }

  function getHref(targetPage: number) {
    return buildListHref(pathname, query, targetPage, limit);
  }

  function getStepProps(targetPage: number, disabled: boolean) {
    return disabled
      ? {
          href: getHref(page),
          'aria-disabled': true,
          tabIndex: -1,
          className: 'pointer-events-none opacity-50',
        }
      : { href: getHref(targetPage) };
  }

  return (
    <div className='grid grid-cols-2 items-center gap-3 border-t px-4 py-3 sm:grid-cols-[1fr_auto_1fr]'>
      <ListPageSize value={limit} />

      <Pagination className='col-span-2 row-start-1 sm:col-span-1 sm:col-start-2'>
        <PaginationContent className='gap-0 rounded-lg border bg-card p-0.5 shadow-xs sm:gap-0.5'>
          <PaginationItem>
            <PaginationPrevious size='sm' {...getStepProps(page - 1, page <= 1)} />
          </PaginationItem>
          <PaginationDivider />

          {getPageItems(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className='size-8 text-muted-foreground' />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href={getHref(item)}
                  isActive={item === page}
                  aria-label={`Página ${item}`}
                  size='icon-sm'
                  className='w-auto min-w-8 px-2 text-muted-foreground tabular-nums data-[active=true]:border-brand-200 data-[active=true]:bg-brand-50 data-[active=true]:font-semibold data-[active=true]:text-brand-700 data-[active=true]:shadow-none dark:data-[active=true]:border-brand-800 dark:data-[active=true]:bg-brand-950 dark:data-[active=true]:text-brand-300'
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationDivider />
          <PaginationItem>
            <PaginationNext size='sm' {...getStepProps(page + 1, page >= totalPages)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <p className='justify-self-end text-sm text-muted-foreground tabular-nums'>
        Página <span className='font-medium text-foreground'>{page}</span> de{' '}
        <span className='font-medium text-foreground'>{totalPages}</span>
      </p>
    </div>
  );
}
