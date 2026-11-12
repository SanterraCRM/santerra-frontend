'use client';

import { Trash2 } from 'lucide-react';
import { type MouseEvent, type ReactNode, type RefObject, useState } from 'react';
import { toast } from 'sonner';

import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useDeleteRecord } from '@/hooks/use-delete-record';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';

export type DeleteDialogTexts = {
  actionLabel?: string;
  title?: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  successMessage: string;
  errorMessage: string;
};

export type DeleteDialogOptions = DeleteDialogTexts & {
  recordName: string;
  deletePath: string;
};

type ConfirmDeleteDialogProps = DeleteDialogOptions & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  children?: ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export function ConfirmDeleteDialog({
  recordName,
  deletePath,
  title,
  description,
  warning,
  confirmLabel,
  successMessage,
  errorMessage,
  open,
  onOpenChange,
  onDeleted,
  children,
  returnFocusRef,
}: ConfirmDeleteDialogProps) {
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteRecord();
  const [inUseMessage, setInUseMessage] = useState<string | null>(null);

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    try {
      await deleteRecord(deletePath);
    } catch (error) {
      if (isApiErrorWithCode(error, 'RESOURCE_IN_USE')) {
        setInUseMessage(error.message);
        return;
      }

      toast.error(getApiErrorMessage(error, errorMessage));
      return;
    }

    onOpenChange(false);
    toast.success(successMessage);
    onDeleted();
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isDeleting && onOpenChange(nextOpen)}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}

      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          setInUseMessage(null);

          if (returnFocusRef?.current) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className='bg-destructive/10 text-destructive'>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>{title ?? <>Excluir {recordName}?</>}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {inUseMessage ? (
          <Alert variant='error'>{inUseMessage}</Alert>
        ) : (
          warning && <Alert variant='warning'>{warning}</Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{inUseMessage ? 'Fechar' : 'Cancelar'}</AlertDialogCancel>
          {!inUseMessage && (
            <AlertDialogAction variant='destructive' disabled={isDeleting} onClick={handleDelete}>
              {isDeleting && <Spinner />}
              {isDeleting ? 'Excluindo...' : confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
