'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Tractor } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { ActionCard } from '@/components/crud/action-card';
import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { Button } from '@/components/ui/button';
import { useCreateProducer } from '@/hooks/producers/use-create-producer';
import { useUpdateProducer } from '@/hooks/producers/use-update-producer';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage } from '@/lib/api';
import { maskDecimal } from '@/lib/format';
import { optionalDecimalSchema, optionalTextSchema } from '@/lib/schemas';
import type { PersonProducer } from '@/types/person';
import type { Potential } from '@/types/potential';
import type { ProducerInput } from '@/types/producer';

export const producerFieldsSchema = z.object({
  potentialId: z.string(),
  address: optionalTextSchema,
  mainCrop: optionalTextSchema,
  totalArea: optionalDecimalSchema,
});

type ProducerFieldsInput = z.input<typeof producerFieldsSchema>;
type ProducerFieldsOutput = z.output<typeof producerFieldsSchema>;

export function checkProducerFields(values: ProducerFieldsOutput, context: z.core.$RefinementCtx) {
  if (!values.potentialId) {
    context.addIssue({
      code: 'custom',
      path: ['potentialId'],
      message: 'Selecione o potencial do produtor',
    });
  }

  if (values.totalArea !== null && values.totalArea <= 0) {
    context.addIssue({
      code: 'custom',
      path: ['totalArea'],
      message: 'Informe uma área maior que zero',
    });
  }
}

const producerFormSchema = producerFieldsSchema.superRefine(checkProducerFields);

export function toProducerFormValues(producer?: PersonProducer | null): ProducerFieldsInput {
  const totalArea = producer?.totalArea ?? null;

  return {
    potentialId: producer?.potential.id ?? '',
    address: producer?.address ?? '',
    mainCrop: producer?.mainCrop ?? '',
    totalArea: totalArea === null ? '' : maskDecimal(String(totalArea)),
  };
}

export function toProducerInput(values: ProducerFieldsOutput): ProducerInput {
  return {
    potentialId: values.potentialId,
    address: values.address,
    mainCrop: values.mainCrop,
    totalArea: values.totalArea,
  };
}

function getPotentialDescription(hasPotentials: boolean, canCreatePotential: boolean): ReactNode {
  if (hasPotentials) {
    return 'Classificação do produtor pela empresa.';
  }

  if (!canCreatePotential) {
    return 'Cadastre um potencial antes de cadastrar produtores.';
  }

  return (
    <>
      <Link href='/admin/potentials/new'>Cadastre um potencial</Link> antes de cadastrar produtores.
    </>
  );
}

type ProducerFieldsProps = {
  potentials: Pick<Potential, 'id' | 'name'>[];
  canCreatePotential?: boolean;
};

export function ProducerFields({ potentials, canCreatePotential = false }: ProducerFieldsProps) {
  const { control } = useFormContext<ProducerFieldsInput>();
  const hasPotentials = potentials.length > 0;

  return (
    <div className='grid gap-5 sm:grid-cols-2'>
      <FormSelect
        control={control}
        name='potentialId'
        label='Potencial'
        required
        options={potentials.map(({ id, name }) => ({ value: id, label: name }))}
        placeholder={hasPotentials ? 'Selecione o potencial' : 'Nenhum potencial cadastrado'}
        disabled={!hasPotentials}
        description={getPotentialDescription(hasPotentials, canCreatePotential)}
        className='sm:col-span-2'
      />
      <FormInput
        control={control}
        name='mainCrop'
        label='Cultura principal'
        autoComplete='off'
        placeholder='Ex.: Soja'
      />
      <FormInput
        control={control}
        name='totalArea'
        label='Área total (ha)'
        inputMode='decimal'
        autoComplete='off'
        placeholder='Ex.: 120,5'
        mask={maskDecimal}
      />
      <FormInput
        control={control}
        name='address'
        label='Endereço'
        autoComplete='street-address'
        placeholder='Ex.: Linha Rio Bonito, km 4, Nova Veneza'
        className='sm:col-span-2'
      />
    </div>
  );
}

type ProducerFormProps = {
  personId: string;
  listHref: string;
  producer?: PersonProducer;
  potentials: Pick<Potential, 'id' | 'name'>[];
  canCreatePotential?: boolean;
  action?: ReactNode;
};

export default function ProducerForm({
  personId,
  listHref,
  producer,
  potentials,
  canCreatePotential = false,
  action,
}: ProducerFormProps) {
  const returnToList = useReturnToList(listHref);
  const { mutate: createProducer } = useCreateProducer();
  const { mutate: updateProducer } = useUpdateProducer();
  const [isOpen, setIsOpen] = useState(Boolean(producer));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(producerFormSchema),
    defaultValues: toProducerFormValues(producer),
  });
  const {
    handleSubmit,
    reset,
    setFocus,
    formState: { isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    if (isOpen && !producer) {
      setFocus('potentialId');
    }
  }, [isOpen, producer, setFocus]);

  async function handleSave(values: ProducerFieldsOutput) {
    setErrorMessage(null);

    try {
      if (producer) {
        await updateProducer(producer.id, toProducerInput(values));
      } else {
        await createProducer(personId, toProducerInput(values));
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(producer ? 'Alterações salvas.' : 'Produtor cadastrado.');
  }

  if (!isOpen) {
    return (
      <ActionCard
        title='Produtor'
        description='Esta pessoa não é produtor da empresa.'
        action={
          <Button variant='outline' onClick={() => setIsOpen(true)}>
            <Tractor />
            Tornar produtor
          </Button>
        }
      />
    );
  }

  return (
    <FormProvider {...form}>
      <FormCard
        title='Dados de produtor'
        description='Potencial, cultura principal, área e endereço.'
        action={action}
        onSubmit={handleSubmit(handleSave)}
        errorMessage={errorMessage}
        isEditing={Boolean(producer)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => reset()}
        onCancel={() => {
          reset();
          setErrorMessage(null);
          setIsOpen(false);
        }}
        createLabel='Tornar produtor'
      >
        <ProducerFields potentials={potentials} canCreatePotential={canCreatePotential} />
      </FormCard>
    </FormProvider>
  );
}
