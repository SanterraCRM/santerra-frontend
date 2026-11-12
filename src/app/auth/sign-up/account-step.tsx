'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { MailIcon, UserIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { emailSchema } from '@/lib/schemas';

import { StepActions } from './step-actions';

const accountStepSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
  email: emailSchema,
});

export type AccountValues = z.output<typeof accountStepSchema>;

type AccountStepProps = {
  defaultValues: AccountValues;
  emailError: string | null;
  onSubmit: (values: AccountValues) => void;
};

export function AccountStep({ defaultValues, emailError, onSubmit }: AccountStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountStepSchema),
    defaultValues,
  });

  return (
    <>
      <AuthHeader
        title='Crie sua conta'
        description='Comece pelo seu nome e pelo e-mail que você vai usar para entrar.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        <TextField
          label='Nome'
          autoComplete='name'
          placeholder='Seu nome completo'
          icon={<UserIcon />}
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          label='E-mail'
          type='email'
          autoComplete='email'
          placeholder='seu@email.com'
          icon={<MailIcon />}
          autoFocus={Boolean(emailError)}
          error={errors.email?.message ?? emailError ?? undefined}
          {...register('email')}
        />

        <StepActions submitLabel='Continuar' />
      </form>
    </>
  );
}
