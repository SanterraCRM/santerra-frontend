'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { BackToLoginLink } from '@/components/auth/back-to-login-link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { KeyIcon, MailIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useRequestPasswordReset } from '@/hooks/auth/use-request-password-reset';
import { getApiErrorMessage } from '@/lib/api';
import { emailSchema } from '@/lib/schemas';

const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordValues = z.output<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordForm() {
  const { mutate: requestPasswordReset } = useRequestPasswordReset();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  async function handleRequestReset({ email }: ForgotPasswordValues) {
    setErrorMessage(null);

    try {
      await requestPasswordReset(email);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Não foi possível enviar o link agora. Tente novamente em instantes.',
        ),
      );
      return;
    }

    setSentTo(email);
  }

  if (sentTo) {
    return (
      <>
        <AuthHeader
          icon={<MailIcon className='size-7' />}
          title='Verifique seu e-mail'
          description={
            <>
              Se existir uma conta com <strong className='font-semibold text-slate-700'>{sentTo}</strong>,
              você vai receber um link para criar uma nova senha. O link vale por 60 minutos.
            </>
          }
        />

        <div className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'>
          {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

          <Alert variant='info'>
            Não recebeu? Confira a caixa de spam ou envie o link novamente.
          </Alert>

          <Button
            type='button'
            variant='outline'
            size='xl'
            className='w-full'
            loading={isSubmitting}
            loadingText='Reenviando...'
            onClick={handleSubmit(handleRequestReset)}
          >
            Reenviar link
          </Button>
        </div>

        <BackToLoginLink />
      </>
    );
  }

  return (
    <>
      <AuthHeader
        icon={<KeyIcon className='size-7' />}
        title='Esqueceu sua senha?'
        description='Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleRequestReset)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

        <TextField
          label='E-mail'
          type='email'
          autoComplete='email'
          placeholder='seu@email.com'
          icon={<MailIcon />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type='submit'
          size='xl'
          className='mt-2 w-full'
          loading={isSubmitting}
          loadingText='Enviando...'
        >
          Enviar link de recuperação
        </Button>
      </form>

      <BackToLoginLink />
    </>
  );
}
