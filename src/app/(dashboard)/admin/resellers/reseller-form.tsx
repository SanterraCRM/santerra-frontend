'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { z } from 'zod';

import {
  BusinessContactFields,
  createBusinessContactSchema,
  toBusinessContactValues,
} from '@/components/form/business-contact-fields';
import { FormCard } from '@/components/form/form-card';
import { useCreateReseller } from '@/hooks/resellers/use-create-reseller';
import { useUpdateReseller } from '@/hooks/resellers/use-update-reseller';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import type { Reseller } from '@/types/reseller';

const resellerFormSchema = createBusinessContactSchema('Informe o nome da revenda');

type ResellerFormOutput = z.output<typeof resellerFormSchema>;

type ResellerFormProps = {
  reseller?: Reseller;
};

export default function ResellerForm({ reseller }: ResellerFormProps) {
  const returnToList = useReturnToList('/admin/resellers');
  const { mutate: createReseller } = useCreateReseller();
  const { mutate: updateReseller } = useUpdateReseller();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(resellerFormSchema),
    defaultValues: toBusinessContactValues(reseller),
  });
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = form;

  async function handleSave(values: ResellerFormOutput) {
    setErrorMessage(null);

    try {
      if (reseller) {
        await updateReseller(reseller.id, values);
      } else {
        await createReseller(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('registrationNumber', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(reseller ? 'Alterações salvas.' : 'Revenda cadastrada.');
  }

  return (
    <FormProvider {...form}>
      <FormCard
        title='Dados da revenda'
        description='Nome, CNPJ e dados de contato.'
        onSubmit={handleSubmit(handleSave)}
        errorMessage={errorMessage}
        isEditing={Boolean(reseller)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => reset()}
        cancelHref='/admin/resellers'
        createLabel='Cadastrar revenda'
      >
        <BusinessContactFields emailPlaceholder='contato@revenda.com.br' />
      </FormCard>
    </FormProvider>
  );
}
