'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { useCreateHarvest } from '@/hooks/harvests/use-create-harvest';
import { useUpdateHarvest } from '@/hooks/harvests/use-update-harvest';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import type { Harvest } from '@/types/harvest';

const LIST_HREF = '/admin/platform/harvests';

const harvestFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da cultura'),
});

type HarvestFormValues = z.infer<typeof harvestFormSchema>;

type HarvestFormProps = {
  harvest?: Harvest;
};

export default function HarvestForm({ harvest }: HarvestFormProps) {
  const returnToList = useReturnToList(LIST_HREF);
  const { mutate: createHarvest } = useCreateHarvest();
  const { mutate: updateHarvest } = useUpdateHarvest();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues: { name: harvest?.name ?? '' },
  });

  async function handleSave(values: HarvestFormValues) {
    setErrorMessage(null);

    try {
      if (harvest) {
        await updateHarvest(harvest.id, values);
      } else {
        await createHarvest(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('name', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(harvest ? 'Alterações salvas.' : 'Cultura cadastrada.');
  }

  return (
    <FormCard
      title='Dados da cultura'
      description='O nome que as empresas veem nas visitas.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(harvest)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={LIST_HREF}
      createLabel='Cadastrar cultura'
    >
      <FormInput
        control={control}
        name='name'
        label='Nome'
        required
        autoComplete='off'
        placeholder='Ex.: Soja'
      />
    </FormCard>
  );
}
