'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ModalProps = {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  actions?: ReactNode;
  cancelLabel?: string;
  size?: 'default' | 'wide';
};

export function Modal({
  title,
  description,
  children,
  trigger,
  open,
  onOpenChange,
  actions,
  cancelLabel = 'Cancelar',
  size = 'default',
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className={size === 'wide' ? 'sm:max-w-3xl' : undefined}>
        <DialogHeader>
          <DialogTitle className='text-lg'>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {actions && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>{cancelLabel}</Button>
            </DialogClose>
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
