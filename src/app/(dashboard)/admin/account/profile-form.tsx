'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { useUpdateProfile } from '@/hooks/auth/use-update-profile';
import { getApiErrorMessage } from '@/lib/api';
import type { Account } from '@/types/account';

const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o seu nome'),
  email: z.string(),
});

type ProfileFormInput = z.input<typeof profileFormSchema>;
type ProfileFormOutput = z.output<typeof profileFormSchema>;

function toFormValues(account: Pick<Account, 'name' | 'email'>): ProfileFormInput {
  return {
    name: account.name,
    email: account.email,
  };
}

type ProfileFormProps = {
  account: Account;
};

export default function ProfileForm({ account }: ProfileFormProps) {
  const router = useRouter();
  const { update: refreshSession } = useSession();
  const { mutate: updateProfile } = useUpdateProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toFormValues(account),
  });

  async function handleSave({ name }: ProfileFormOutput) {
    setErrorMessage(null);
    let saved: Account;

    try {
      saved = await updateProfile({ name });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    await refreshSession();
    reset(toFormValues(saved));
    toast.success('Alterações salvas.');
    router.refresh();
  }

  return (
    <FormCard
      title='Dados pessoais'
      description='Seu nome aparece para a equipe e no menu da conta.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin'
      createLabel='Salvar'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput control={control} name='name' label='Nome' required autoComplete='name' />
        <FormInput
          control={control}
          name='email'
          label='E-mail'
          type='email'
          disabled
          description='O e-mail de acesso não pode ser alterado por aqui.'
        />
      </div>
    </FormCard>
  );
}
