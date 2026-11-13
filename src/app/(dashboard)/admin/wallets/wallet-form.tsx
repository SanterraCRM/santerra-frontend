'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormAsyncCombobox } from '@/components/form/form-async-combobox';
import { FormCard } from '@/components/form/form-card';
import { FormMoneyInput } from '@/components/form/form-money-input';
import { useCreateWallet } from '@/hooks/wallets/use-create-wallet';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { optionalMoneySchema, requiredOptionSchema } from '@/lib/schemas';

import { WALLETS_HREF } from './wallets-config';

const walletFormSchema = z.object({
  userCompanyId: requiredOptionSchema('Selecione o membro'),
  value: optionalMoneySchema,
});

type WalletFormOutput = z.output<typeof walletFormSchema>;

type WalletFormProps = {
  hasAvailableMembers: boolean;
  defaultMember: ComboboxOption | null;
};

export default function WalletForm({ hasAvailableMembers, defaultMember }: WalletFormProps) {
  const returnToList = useReturnToList(WALLETS_HREF);
  const { mutate: createWallet } = useCreateWallet();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(walletFormSchema),
    defaultValues: { userCompanyId: defaultMember, value: '' },
  });

  async function handleSave({ userCompanyId, value }: WalletFormOutput) {
    setErrorMessage(null);

    try {
      await createWallet({ userCompanyId, ...(value !== null && { value }) });
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('userCompanyId', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList('Carteira criada.');
  }

  return (
    <FormCard
      title='Dados da carteira'
      description='O membro dono da carteira e o saldo com que ela começa.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={false}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={WALLETS_HREF}
      createLabel='Criar carteira'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormAsyncCombobox
          control={control}
          name='userCompanyId'
          label='Membro'
          required
          source='membersWithoutWallet'
          placeholder='Selecione o membro'
          searchPlaceholder='Buscar pelo nome ou e-mail'
          disabled={!hasAvailableMembers}
          description={
            hasAvailableMembers
              ? 'Só aparecem membros ativos que ainda não têm carteira.'
              : 'Todos os membros ativos já têm carteira.'
          }
        />
        <FormMoneyInput
          control={control}
          name='value'
          label='Saldo inicial'
          description='Depois, o saldo aumenta pelos créditos e diminui pelas ações comerciais.'
        />
      </div>
    </FormCard>
  );
}
