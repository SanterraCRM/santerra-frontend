'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { ConfirmDeleteDialog, type DeleteDialogOptions } from './confirm-delete-dialog';

type DeleteRecordButtonProps = DeleteDialogOptions & {
  listHref: string;
  label?: string;
  size?: 'default' | 'sm';
};

export function DeleteRecordButton({
  listHref,
  label,
  size = 'default',
  ...dialog
}: DeleteRecordButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConfirmDeleteDialog
      {...dialog}
      open={isOpen}
      onOpenChange={setIsOpen}
      onDeleted={() => router.push(listHref)}
    >
      <Button variant='destructive' size={size}>
        <Trash2 />
        {label ?? dialog.actionLabel ?? 'Excluir'}
      </Button>
    </ConfirmDeleteDialog>
  );
}
