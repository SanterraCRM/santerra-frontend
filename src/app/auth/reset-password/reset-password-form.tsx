'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { BackToLoginLink } from '@/components/auth/back-to-login-link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, LockIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { useResetPassword } from '@/hooks/auth/use-reset-password';
import { getApiErrorMessage, isApiErrorWithStatus } from '@/lib/api';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { createPasswordConfirmationSchema } from '@/lib/schemas';

const resetPasswordFormSchema = createPasswordConfirmationSchema('Confirme a nova senha');

type ResetPasswordValues = z.output<typeof resetPasswordFormSchema>;

type ResetPasswordFormProps = {
  token: string;
};

type ResetError = {
  message: string;
  isInvalidLink: boolean;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { mutate: resetPassword } = useResetPassword();
  const [isDone, setIsDone] = useState(false);
  const [resetError, setResetError] = useState<ResetError | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  async function handleResetPassword({ password }: ResetPasswordValues) {
    setResetError(null);

    try {
      await resetPassword(token, password);
    } catch (error) {
      setResetError({
        message: getApiErrorMessage(
          error,
          'Não foi possível salvar a nova senha agora. Tente novamente em instantes.',
        ),
        isInvalidLink: isApiErrorWithStatus(error, 404),
      });
      return;
    }

    setIsDone(true);
  }

  if (isDone) {
    return (
      <>
        <AuthHeader
          icon={<CheckCircleIcon className='size-7' />}
          title='Senha alterada!'
          description='Sua senha foi redefinida com sucesso. Agora é só entrar com a nova senha.'
        />

        <Button href='/auth/login' size='xl' className='w-full animate-fade-up'>
          Ir para o login
        </Button>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        icon={<LockIcon className='size-7' />}
        title='Crie uma nova senha'
        description='Escolha uma senha nova para acessar sua conta.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleResetPassword)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {resetError && (
          <Alert variant='error'>
            {resetError.message}
            {resetError.isInvalidLink && (
              <>
                {' '}
                <Link
                  href='/auth/forgot-password'
                  className='font-semibold underline underline-offset-2 hover:text-red-900'
                >
                  Solicitar um novo link
                </Link>
              </>
            )}
          </Alert>
        )}

        <PasswordField
          label='Nova senha'
          autoComplete='new-password'
          placeholder='Digite a nova senha'
          hint={`Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordField
          label='Confirmar nova senha'
          autoComplete='new-password'
          placeholder='Repita a nova senha'
          error={errors.passwordConfirmation?.message}
          {...register('passwordConfirmation')}
        />

        <Button
          type='submit'
          size='xl'
          className='mt-2 w-full'
          loading={isSubmitting}
          loadingText='Salvando...'
        >
          Salvar nova senha
        </Button>
      </form>

      <BackToLoginLink />
    </>
  );
}
