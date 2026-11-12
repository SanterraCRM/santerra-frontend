'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormSwitch } from '@/components/form/form-switch';
import { useCreatePlatformUser } from '@/hooks/platform-users/use-create-platform-user';
import { useUpdatePlatformUser } from '@/hooks/platform-users/use-update-platform-user';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { emailSchema } from '@/lib/schemas';
import type { PlatformUser } from '@/types/platform';

import { PLATFORM_USERS_HREF } from './users-config';

const PASSWORD_MESSAGE = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;

const baseSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  email: emailSchema,
  active: z.boolean(),
});

const newUserSchema = baseSchema.extend({
  password: z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_MESSAGE),
});

const editUserSchema = baseSchema.extend({
  password: z
    .string()
    .refine((value) => !value || value.length >= MIN_PASSWORD_LENGTH, PASSWORD_MESSAGE),
});

type UserFormValues = z.output<typeof newUserSchema>;

type UserFormProps = {
  user?: PlatformUser;
  isSelf?: boolean;
};

export default function UserForm({ user, isSelf = false }: UserFormProps) {
  const returnToList = useReturnToList(PLATFORM_USERS_HREF);
  const { mutate: createUser } = useCreatePlatformUser();
  const { mutate: updateUser } = useUpdatePlatformUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(user ? editUserSchema : newUserSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      active: user?.active ?? true,
      password: '',
    },
  });

  async function handleSave({ password, ...values }: UserFormValues) {
    setErrorMessage(null);

    const input = { ...values, ...(password && { password }) };

    try {
      if (user) {
        await updateUser(user.id, input);
      } else {
        await createUser(input);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('email', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(user ? 'Alterações salvas.' : 'Usuário cadastrado.');
  }

  return (
    <FormCard
      title='Dados do usuário'
      description='Nome, e-mail de acesso, senha e situação da conta.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(user)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={PLATFORM_USERS_HREF}
      createLabel='Cadastrar usuário'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput control={control} name='name' label='Nome' required autoComplete='off' />
        <FormInput
          control={control}
          name='email'
          label='E-mail'
          type='email'
          required
          autoComplete='off'
          placeholder='nome@empresa.com.br'
        />
        <FormInput
          control={control}
          name='password'
          label={user ? 'Nova senha' : 'Senha'}
          type='password'
          required={!user}
          autoComplete='new-password'
          description={
            user
              ? 'Deixe em branco para manter a senha atual.'
              : `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres. Passe a senha para a pessoa por um canal seguro.`
          }
          className='sm:col-span-2'
        />
        <FormSwitch
          control={control}
          name='active'
          label='Ativo'
          description={
            isSelf
              ? 'Você não pode desativar a sua própria conta.'
              : 'Quem está inativo não consegue entrar em nenhuma empresa.'
          }
          disabled={isSelf}
          className='sm:col-span-2'
        />
      </div>
    </FormCard>
  );
}
