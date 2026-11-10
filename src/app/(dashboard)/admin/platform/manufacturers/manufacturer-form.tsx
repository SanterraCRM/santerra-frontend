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
import { useCreateManufacturer } from '@/hooks/manufacturers/use-create-manufacturer';
import { useUpdateManufacturer } from '@/hooks/manufacturers/use-update-manufacturer';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import type { Manufacturer } from '@/types/manufacturer';

const LIST_HREF = '/admin/platform/manufacturers';

const manufacturerFormSchema = createBusinessContactSchema('Informe o nome do fabricante');

type ManufacturerFormOutput = z.output<typeof manufacturerFormSchema>;

type ManufacturerFormProps = {
  manufacturer?: Manufacturer;
};

export default function ManufacturerForm({ manufacturer }: ManufacturerFormProps) {
  const returnToList = useReturnToList(LIST_HREF);
  const { mutate: createManufacturer } = useCreateManufacturer();
  const { mutate: updateManufacturer } = useUpdateManufacturer();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(manufacturerFormSchema),
    defaultValues: toBusinessContactValues(manufacturer),
  });
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = form;

  async function handleSave(values: ManufacturerFormOutput) {
    setErrorMessage(null);

    try {
      if (manufacturer) {
        await updateManufacturer(manufacturer.id, values);
      } else {
        await createManufacturer(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('name', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(manufacturer ? 'Alterações salvas.' : 'Fabricante cadastrado.');
  }

  return (
    <FormProvider {...form}>
      <FormCard
        title='Dados do fabricante'
        description='Nome, CNPJ e dados de contato.'
        onSubmit={handleSubmit(handleSave)}
        errorMessage={errorMessage}
        isEditing={Boolean(manufacturer)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => reset()}
        cancelHref={LIST_HREF}
        createLabel='Cadastrar fabricante'
      >
        <BusinessContactFields emailPlaceholder='contato@fabricante.com.br' />
      </FormCard>
    </FormProvider>
  );
}
