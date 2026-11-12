'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { BuildingIcon, MailIcon, UserIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { createPasswordConfirmationSchema } from '@/lib/schemas';
import type { InvitationPreview } from '@/types/invitation';

import { useAcceptInvitationFlow } from './use-accept-invitation-flow';

const newAccountSchema = createPasswordConfirmationSchema('Confirme a senha').and(
  z.object({ name: z.string().trim().min(1, 'Informe o seu nome') }),
);

const existingAccountSchema = z.object({
  password: z.string().min(1, 'Informe a senha da sua conta'),
});

type AcceptInvitationValues = {
  name?: string;
  password: string;
  passwordConfirmation?: string;
};

type AcceptInvitationFormProps = {
  token: string;
  preview: InvitationPreview;
};

export default function AcceptInvitationForm({ token, preview }: AcceptInvitationFormProps) {
  const { accept, error, isRedirecting, otherAccountEmail } = useAcceptInvitationFlow(
    token,
    preview,
  );
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationValues>({
    resolver: zodResolver(preview.accountExists ? existingAccountSchema : newAccountSchema),
  });

  async function handleAccept({ name, password }: AcceptInvitationValues) {
    const failure = await accept({ name, password });

    if (failure?.field) {
      setError(failure.field, { message: failure.message }, { shouldFocus: true });
    }
  }

  return (
    <>
      <AuthHeader
        icon={<BuildingIcon className='size-7' />}
        title={`Você foi convidado para ${preview.companyName}`}
        description={
          preview.accountExists
            ? 'Você já tem uma conta. Entre com a senha dela para aceitar o convite.'
            : 'Crie a sua conta para entrar na empresa. Depois é só usar este e-mail e a senha.'
        }
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleAccept)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {otherAccountEmail && (
          <Alert variant='info'>
            Você está conectado como {otherAccountEmail}. Ao aceitar, você sai dessa conta e entra
            com {preview.email}.
          </Alert>
        )}

        {error && !error.field && <Alert variant='error'>{error.message}</Alert>}

        <TextField
          label='E-mail'
          type='email'
          value={preview.email}
          readOnly
          disabled
          icon={<MailIcon className='size-5' />}
        />

        {!preview.accountExists && (
          <TextField
            label='Nome'
            autoComplete='name'
            placeholder='Seu nome completo'
            icon={<UserIcon className='size-5' />}
            error={errors.name?.message}
            {...register('name')}
          />
        )}

        <PasswordField
          label={preview.accountExists ? 'Senha' : 'Crie uma senha'}
          autoComplete={preview.accountExists ? 'current-password' : 'new-password'}
          placeholder={preview.accountExists ? 'Digite a sua senha' : 'Digite uma senha'}
          hint={preview.accountExists ? undefined : `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          error={errors.password?.message}
          {...register('password')}
        />

        {!preview.accountExists && (
          <PasswordField
            label='Confirmar senha'
            autoComplete='new-password'
            placeholder='Repita a senha'
            error={errors.passwordConfirmation?.message}
            {...register('passwordConfirmation')}
          />
        )}

        <Button
          type='submit'
          size='xl'
          className='mt-2 w-full'
          loading={isSubmitting || isRedirecting}
          loadingText={isRedirecting ? 'Entrando...' : 'Aceitando...'}
        >
          {preview.accountExists ? 'Aceitar e entrar' : 'Criar conta e entrar'}
        </Button>
      </form>
    </>
  );
}
