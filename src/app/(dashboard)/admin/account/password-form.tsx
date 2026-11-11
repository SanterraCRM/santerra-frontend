'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { useChangePassword } from '@/hooks/auth/use-change-password';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { createPasswordConfirmationSchema } from '@/lib/schemas';

const passwordFormSchema = z
  .object({ currentPassword: z.string().min(1, 'Informe a senha atual') })
  .and(createPasswordConfirmationSchema('Confirme a nova senha'))
  .refine((values) => values.password !== values.currentPassword, {
    message: 'A nova senha precisa ser diferente da atual',
    path: ['password'],
  });

type PasswordFormOutput = z.output<typeof passwordFormSchema>;

const EMPTY_VALUES = { currentPassword: '', password: '', passwordConfirmation: '' };

type PasswordFormProps = {
  email: string;
};

export default function PasswordForm({ email }: PasswordFormProps) {
  const { mutate: changePassword } = useChangePassword();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  async function handleSave({ currentPassword, password }: PasswordFormOutput) {
    setErrorMessage(null);

    try {
      await changePassword({ currentPassword, newPassword: password });
    } catch (error) {
      if (isApiErrorWithCode(error, 'INVALID_CURRENT_PASSWORD')) {
        setError('currentPassword', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(
        getApiErrorMessage(error, 'Não foi possível alterar a senha agora. Tente novamente.'),
      );
      return;
    }

    reset(EMPTY_VALUES);
    toast.success('Senha alterada.');
  }

  return (
    <FormCard
      title='Senha'
      description='Para trocar a senha, confirme a senha atual.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin'
      createLabel='Alterar senha'
      saveLabel='Alterar senha'
    >
      <input type='text' name='username' autoComplete='username' value={email} readOnly hidden />
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='currentPassword'
          label='Senha atual'
          type='password'
          required
          autoComplete='current-password'
          className='sm:col-span-2'
        />
        <FormInput
          control={control}
          name='password'
          label='Nova senha'
          type='password'
          required
          autoComplete='new-password'
          description={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
        />
        <FormInput
          control={control}
          name='passwordConfirmation'
          label='Confirmar nova senha'
          type='password'
          required
          autoComplete='new-password'
        />
      </div>
    </FormCard>
  );
}
