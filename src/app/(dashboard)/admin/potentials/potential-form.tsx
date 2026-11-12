'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreatePotential } from '@/hooks/potentials/use-create-potential';
import { useUpdatePotential } from '@/hooks/potentials/use-update-potential';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { maskDecimal } from '@/lib/format';
import { optionalDecimalSchema, optionalTextSchema } from '@/lib/schemas';
import type { Potential } from '@/types/potential';

const potentialFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do potencial'),
  numericValue: optionalDecimalSchema,
  description: optionalTextSchema,
});

type PotentialFormInput = z.input<typeof potentialFormSchema>;
type PotentialFormOutput = z.output<typeof potentialFormSchema>;

function toFormValues(potential?: Potential): PotentialFormInput {
  const numericValue = potential?.numericValue ?? null;

  return {
    name: potential?.name ?? '',
    numericValue: numericValue === null ? '' : maskDecimal(String(numericValue)),
    description: potential?.description ?? '',
  };
}

type PotentialFormProps = {
  potential?: Potential;
};

export default function PotentialForm({ potential }: PotentialFormProps) {
  const returnToList = useReturnToList('/admin/potentials');
  const { mutate: createPotential } = useCreatePotential();
  const { mutate: updatePotential } = useUpdatePotential();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(potentialFormSchema),
    defaultValues: toFormValues(potential),
  });

  async function handleSave(values: PotentialFormOutput) {
    setErrorMessage(null);

    try {
      if (potential) {
        await updatePotential(potential.id, values);
      } else {
        await createPotential(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('name', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(potential ? 'Alterações salvas.' : 'Potencial cadastrado.');
  }

  return (
    <FormCard
      title='Dados do potencial'
      description='Nome, valor na escala e descrição.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(potential)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/potentials'
      createLabel='Cadastrar potencial'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='off'
          placeholder='Ex.: Alto'
        />
        <FormInput
          control={control}
          name='numericValue'
          label='Valor'
          inputMode='decimal'
          autoComplete='off'
          placeholder='Ex.: 80'
          mask={maskDecimal}
          description='O maior valor aparece primeiro nas listas.'
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='O que caracteriza um produtor com este potencial'
          className='sm:col-span-2'
        />
      </div>
    </FormCard>
  );
}
