'use client';

import type { FormEventHandler, ReactNode } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type FormCardCancel =
  | { cancelHref: string; onCancel?: never }
  | { cancelHref?: never; onCancel: () => void };

type FormCardProps = FormCardCancel & {
  title: string;
  description: string;
  action?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  errorMessage?: string | null;
  children: ReactNode;
  isEditing: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  onDiscard: () => void;
  createLabel: string;
  saveLabel?: string;
};

export function FormCard({
  title,
  description,
  action,
  onSubmit,
  errorMessage,
  children,
  isEditing,
  isDirty,
  isSubmitting,
  onDiscard,
  cancelHref,
  onCancel,
  createLabel,
  saveLabel = 'Salvar alterações',
}: FormCardProps) {
  return (
    <form noValidate onSubmit={onSubmit} className='animate-fade-up [animation-delay:80ms]'>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>

        <CardContent className='gap-5'>
          {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}
          {children}
        </CardContent>

        <CardFooter className='justify-end gap-2 border-t'>
          {isEditing && (
            <Button
              type='button'
              variant='outline'
              disabled={!isDirty || isSubmitting}
              onClick={onDiscard}
            >
              Descartar alterações
            </Button>
          )}
          {!isEditing &&
            (onCancel ? (
              <Button type='button' variant='outline' disabled={isSubmitting} onClick={onCancel}>
                Cancelar
              </Button>
            ) : (
              <Button href={cancelHref} variant='outline'>
                Cancelar
              </Button>
            ))}

          <Button
            type='submit'
            disabled={isEditing && !isDirty}
            loading={isSubmitting}
            loadingText='Salvando...'
          >
            {isEditing ? saveLabel : createLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
