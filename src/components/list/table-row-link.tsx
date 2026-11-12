'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

import { TableRow } from '@/components/ui/table';
import { cn } from '@/lib/cn';

type TableRowLinkProps = ComponentProps<typeof TableRow> & {
  href: string;
};

export function TableRowLink({ href, className, ...props }: TableRowLinkProps) {
  const router = useRouter();

  function shouldIgnore(event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;

    return (
      !event.currentTarget.contains(target) ||
      target.closest('a, button, input') !== null ||
      Boolean(window.getSelection()?.toString())
    );
  }

  function handleClick(event: MouseEvent<HTMLTableRowElement>) {
    if (shouldIgnore(event)) {
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      window.open(href, '_blank');
      return;
    }

    router.push(href);
  }

  function handleAuxClick(event: MouseEvent<HTMLTableRowElement>) {
    if (event.button === 1 && !shouldIgnore(event)) {
      window.open(href, '_blank');
    }
  }

  return (
    <TableRow
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}
