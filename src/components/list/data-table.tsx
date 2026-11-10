import Link from 'next/link';
import type { ReactNode } from 'react';

import type { DeleteDialogOptions } from '@/components/crud/confirm-delete-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/initials';

import { RowActions } from './row-actions';
import { TableRowLink } from './table-row-link';

const VISIBLE_FROM = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  visibleFrom?: keyof typeof VISIBLE_FROM;
  align?: 'end';
};

type DataTableProps<T extends { id: string }> = {
  rows: T[];
  rowHref?: (row: T) => string;
  primary: {
    header: string;
    title: (row: T) => string;
    subtitle?: (row: T) => ReactNode;
    avatar?: boolean;
  };
  columns: DataTableColumn<T>[];
  actions: {
    canUpdate: boolean | ((row: T) => boolean);
    deleteDialog?: (row: T) => DeleteDialogOptions | undefined;
  };
  emptyState: ReactNode;
  footer?: ReactNode;
};

export function DataTable<T extends { id: string }>({
  rows,
  rowHref,
  primary,
  columns,
  actions,
  emptyState,
  footer,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return emptyState;
  }

  return (
    <div className='overflow-hidden rounded-xl border bg-card animate-fade-up [animation-delay:80ms]'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='px-4 text-muted-foreground'>{primary.header}</TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.header}
                className={cn(
                  'px-4 text-muted-foreground',
                  column.align === 'end' && 'text-right',
                  column.visibleFrom && VISIBLE_FROM[column.visibleFrom],
                )}
              >
                {column.header}
              </TableHead>
            ))}
            <TableHead className='w-20 px-4 text-center text-muted-foreground'>Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const href = rowHref?.(row);
            const title = primary.title(row);
            const cells = (
              <>
                <TableCell className='w-full max-w-0 px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    {primary.avatar && (
                      <Avatar className='size-9'>
                        <AvatarFallback className='bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300'>
                          {getInitials(title)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className='min-w-0'>
                      {href ? (
                        <Link
                          href={href}
                          className='block truncate rounded-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'
                        >
                          {title}
                        </Link>
                      ) : (
                        <p className='truncate font-medium text-foreground'>{title}</p>
                      )}
                      {primary.subtitle && (
                        <p className='truncate text-xs text-muted-foreground'>
                          {primary.subtitle(row)}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.header}
                    className={cn(
                      'px-4 py-3 text-muted-foreground tabular-nums',
                      column.align === 'end' && 'text-right',
                      column.visibleFrom && VISIBLE_FROM[column.visibleFrom],
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
                <TableCell className='px-4 py-2 text-center'>
                  <RowActions
                    label={title}
                    href={href}
                    canUpdate={
                      typeof actions.canUpdate === 'function'
                        ? actions.canUpdate(row)
                        : actions.canUpdate
                    }
                    deleteDialog={actions.deleteDialog?.(row)}
                  />
                </TableCell>
              </>
            );

            return href ? (
              <TableRowLink key={row.id} href={href}>
                {cells}
              </TableRowLink>
            ) : (
              <TableRow key={row.id}>{cells}</TableRow>
            );
          })}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}
