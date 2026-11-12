'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { AuthSwitchLink } from '@/components/auth/auth-switch-link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MailIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { useLogin } from '@/hooks/auth/use-login';
import { getLoginErrorMessage, LoginError } from '@/lib/auth-errors';
import { emailSchema } from '@/lib/schemas';

const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha'),
});

type LoginFormProps = {
  callbackUrl: string;
  initialError?: string;
};

export default function LoginForm({ callbackUrl, initialError }: LoginFormProps) {
  const { mutate: login } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError ? getLoginErrorMessage(initialError) : null,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
  });

  async function handleLogin(values: z.output<typeof loginFormSchema>) {
    setErrorMessage(null);

    try {
      await login(values);
    } catch (error) {
      setErrorMessage(error instanceof LoginError ? error.message : getLoginErrorMessage());
      return;
    }

    setIsRedirecting(true);
    window.location.assign(callbackUrl);
  }

  return (
    <>
      <AuthHeader
        title='Bem-vindo de volta'
        description='Entre com seu e-mail e senha para acessar o painel.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleLogin)}
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

        <PasswordField
          label='Senha'
          autoComplete='current-password'
          placeholder='Digite sua senha'
          error={errors.password?.message}
          labelAction={
            <Link
              href='/auth/forgot-password'
              className='rounded text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
            >
              Esqueceu sua senha?
            </Link>
          }
          {...register('password')}
        />

        <Button
          type='submit'
          size='xl'
          className='mt-2 w-full'
          loading={isSubmitting || isRedirecting}
          loadingText='Entrando...'
        >
          Entrar
        </Button>
      </form>

      <AuthSwitchLink question='Ainda não tem uma conta?' href='/auth/sign-up' label='Cadastre-se' />
    </>
  );
}
