'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { PasswordField } from '@/components/ui/password-field';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { createPasswordConfirmationSchema } from '@/lib/schemas';

import { PasswordStrength } from './password-strength';
import { StepActions } from './step-actions';

const passwordStepSchema = createPasswordConfirmationSchema('Confirme sua senha');

export type PasswordValues = z.output<typeof passwordStepSchema>;

type PasswordStepProps = {
  email: string;
  defaultValues: PasswordValues;
  error: string | null;
  onBack: (values: PasswordValues) => void;
  onSubmit: (values: PasswordValues) => Promise<void>;
};

export function PasswordStep({ email, defaultValues, error, onBack, onSubmit }: PasswordStepProps) {
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordStepSchema),
    defaultValues,
  });
  const password = useWatch({ control, name: 'password' });

  return (
    <>
      <AuthHeader
        title='Crie uma senha'
        description={
          <>
            Você vai entrar com <strong className='font-semibold text-slate-700'>{email}</strong> e
            esta senha.
          </>
        }
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {error && <Alert variant='error'>{error}</Alert>}

        <input
          type='email'
          name='username'
          autoComplete='username'
          value={email}
          readOnly
          hidden
        />

        <PasswordField
          label='Senha'
          autoComplete='new-password'
          placeholder='Crie uma senha'
          autoFocus
          hint={
            password
              ? undefined
              : `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres, misturando letras, números e símbolos.`
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordStrength password={password} />

        <PasswordField
          label='Confirmar senha'
          autoComplete='new-password'
          placeholder='Repita a senha'
          error={errors.passwordConfirmation?.message}
          {...register('passwordConfirmation')}
        />

        <StepActions
          submitLabel='Continuar'
          onBack={() => onBack(getValues())}
          loading={isSubmitting}
          loadingText='Enviando código...'
        />
      </form>
    </>
  );
}
