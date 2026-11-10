'use client';

import { Eye, Menu, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import {
  ConfirmDeleteDialog,
  type DeleteDialogOptions,
} from '@/components/crud/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type RowActionsProps = {
  label: string;
  href?: string;
  canUpdate: boolean;
  deleteDialog?: DeleteDialogOptions;
};

export function RowActions({ label, href, canUpdate, deleteDialog }: RowActionsProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!href && !deleteDialog) {
    return (
      <span aria-hidden='true' className='text-muted-foreground'>
        —
      </span>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant='ghost'
            size='icon-sm'
            aria-label={`Ações de ${label}`}
            className='text-muted-foreground'
          >
            <Menu />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-44'>
          {href && (
            <DropdownMenuItem asChild>
              <Link href={href}>
                {canUpdate ? <Pencil /> : <Eye />}
                {canUpdate ? 'Editar' : 'Visualizar'}
              </Link>
            </DropdownMenuItem>
          )}

          {deleteDialog && (
            <>
              {href && <DropdownMenuSeparator />}
              <DropdownMenuItem variant='destructive' onSelect={() => setIsDeleteOpen(true)}>
                <Trash2 />
                {deleteDialog.actionLabel ?? 'Excluir'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteDialog && (
        <ConfirmDeleteDialog
          {...deleteDialog}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onDeleted={() => router.refresh()}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
