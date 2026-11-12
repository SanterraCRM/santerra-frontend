'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormAsyncCombobox } from '@/components/form/form-async-combobox';
import { FormCard } from '@/components/form/form-card';
import { FormFileAttachments } from '@/components/form/form-file-attachments';
import { FormInput } from '@/components/form/form-input';
import { FormMultiSelect } from '@/components/form/form-multi-select';
import { FormSection } from '@/components/form/form-section';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreateCommercialTrip } from '@/hooks/commercial-trips/use-create-commercial-trip';
import { useUpdateCommercialTrip } from '@/hooks/commercial-trips/use-update-commercial-trip';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage } from '@/lib/api';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { toDateInputValue } from '@/lib/format';
import {
  optionalDateSchema,
  optionalTextSchema,
  optionIdsSchema,
  requiredOptionSchema,
  storedFilesSchema,
} from '@/lib/schemas';
import type {
  CommercialTrip,
  CommercialTripInput,
  CommercialTripRelation,
} from '@/types/commercial-trip';

import { COMMERCIAL_TRIPS_HREF, TRIP_STATUS_OPTIONS } from './commercial-trips-config';
import type { TripFormOptions } from './trip-form-options';

const tripFormSchema = z
  .object({
    producer: requiredOptionSchema('Selecione o produtor'),
    responsible: requiredOptionSchema('Selecione o responsável'),
    participants: optionIdsSchema,
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    expectedDate: optionalDateSchema,
    tripDate: optionalDateSchema,
    harvestIds: z.array(z.string()),
    recommendedProducts: optionIdsSchema,
    performedActionDescription: optionalTextSchema,
    followUpDetails: optionalTextSchema,
    pendingIssuesDescription: optionalTextSchema,
    files: storedFilesSchema,
  })
  .refine((values) => values.status !== 'COMPLETED' || values.tripDate !== null, {
    message: 'Informe a data realizada para finalizar a visita.',
    path: ['tripDate'],
  });

type TripFormInput = z.input<typeof tripFormSchema>;
type TripFormOutput = z.output<typeof tripFormSchema>;

function toOption({ id, name }: CommercialTripRelation): ComboboxOption {
  return { value: id, label: name };
}

function toFormValues(trip?: CommercialTrip): TripFormInput {
  return {
    producer: trip ? toOption(trip.producer) : null,
    responsible: trip ? toOption(trip.responsible) : null,
    participants: trip?.participants.map(toOption) ?? [],
    status: trip?.status ?? 'PENDING',
    expectedDate: trip?.expectedDate ? toDateInputValue(trip.expectedDate) : '',
    tripDate: trip?.tripDate ? toDateInputValue(trip.tripDate) : '',
    harvestIds: trip?.harvestIds ?? [],
    recommendedProducts: trip?.recommendedProducts?.map(toOption) ?? [],
    performedActionDescription: trip?.performedActionDescription ?? '',
    followUpDetails: trip?.followUpDetails ?? '',
    pendingIssuesDescription: trip?.pendingIssuesDescription ?? '',
    files: trip?.files ?? [],
  };
}

function toHarvestOptions(harvests: CommercialTripRelation[], current: CommercialTripRelation[]) {
  const missing = current.filter(({ id }) => !harvests.some((harvest) => harvest.id === id));

  return [...harvests, ...missing].map(({ id, name }) => ({ value: id, label: name }));
}

type CommercialTripFormProps = TripFormOptions & {
  trip?: CommercialTrip;
};

export default function CommercialTripForm({
  trip,
  harvests,
  canSearchProducers,
  canSearchEmployees,
  canReadProducts,
  attachments,
}: CommercialTripFormProps) {
  const returnToList = useReturnToList(COMMERCIAL_TRIPS_HREF);
  const { mutate: createTrip } = useCreateCommercialTrip();
  const { mutate: updateTrip } = useUpdateCommercialTrip();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: toFormValues(trip),
  });
  const responsible = useWatch({ control, name: 'responsible' });
  const harvestOptions = toHarvestOptions(harvests, trip?.harvests ?? []);

  function removeResponsibleFromParticipants(next: ComboboxOption[]) {
    const responsibleId = next[0]?.value;

    setValue(
      'participants',
      getValues('participants').filter((participant) => participant.value !== responsibleId),
      { shouldDirty: true },
    );
  }

  async function handleSave({ recommendedProducts, files, ...values }: TripFormOutput) {
    if (isUploading) {
      setErrorMessage('Aguarde o envio dos anexos terminar para salvar.');
      return;
    }

    setErrorMessage(null);

    const input: CommercialTripInput = {
      status: values.status,
      expectedDate: values.expectedDate,
      tripDate: values.tripDate,
      producerId: values.producer,
      responsibleId: values.responsible,
      participantIds: values.participants.filter((id) => id !== values.responsible),
      harvestIds: values.harvestIds,
      performedActionDescription: values.performedActionDescription,
      followUpDetails: values.followUpDetails,
      pendingIssuesDescription: values.pendingIssuesDescription,
      ...(canReadProducts && { recommendedProductIds: recommendedProducts }),
      ...(attachments && { fileIds: files.map((file) => file.id) }),
    };

    try {
      if (trip) {
        await updateTrip(trip.id, input);
      } else {
        await createTrip(input);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(trip ? 'Alterações salvas.' : 'Visita cadastrada.');
  }

  return (
    <FormCard
      title='Dados da visita'
      description='Quem visita, o que foi tratado e o que aconteceu.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(trip)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={COMMERCIAL_TRIPS_HREF}
      createLabel='Cadastrar visita'
    >
      <div className='flex flex-col gap-6'>
        <FormSection title='Visita' description='Produtor, equipe, status e datas.'>
          <FormAsyncCombobox
            control={control}
            name='producer'
            label='Produtor'
            required
            source='producers'
            placeholder='Selecione o produtor'
            searchPlaceholder='Buscar por nome ou CPF/CNPJ'
            disabled={!canSearchProducers}
            description={
              !canSearchProducers && 'Só quem tem acesso aos produtores pode trocar o produtor.'
            }
          />
          <FormAsyncCombobox
            control={control}
            name='responsible'
            label='Responsável'
            required
            source='activeEmployees'
            placeholder='Selecione o responsável'
            searchPlaceholder='Buscar funcionário ativo'
            disabled={!canSearchEmployees}
            onValueChange={removeResponsibleFromParticipants}
            description={
              !canSearchEmployees && 'Só quem tem acesso aos funcionários pode trocar a equipe.'
            }
          />
          <FormAsyncCombobox
            control={control}
            name='participants'
            label='Participantes'
            multiple
            source='activeEmployees'
            placeholder='Selecione os participantes'
            searchPlaceholder='Buscar funcionário ativo'
            excludeValues={responsible ? [responsible.value] : []}
            disabled={!canSearchEmployees}
            className='sm:col-span-2'
          />
          <div className='grid gap-5 sm:col-span-2 sm:grid-cols-3'>
            <FormSelect
              control={control}
              name='status'
              label='Status'
              required
              options={TRIP_STATUS_OPTIONS}
            />
            <FormInput control={control} name='expectedDate' label='Data prevista' type='date' />
            <FormInput control={control} name='tripDate' label='Data realizada' type='date' />
          </div>
        </FormSection>

        <FormSection title='Pauta' description='Culturas e produtos tratados na visita.'>
          <FormMultiSelect
            control={control}
            name='harvestIds'
            label='Culturas'
            options={harvestOptions}
            placeholder='Selecione as culturas'
            emptyMessage='Nenhuma cultura cadastrada.'
          />
          {canReadProducts && (
            <FormAsyncCombobox
              control={control}
              name='recommendedProducts'
              label='Produtos recomendados'
              multiple
              source='products'
              placeholder='Selecione os produtos'
              searchPlaceholder='Buscar produto'
            />
          )}
        </FormSection>

        <FormSection title='Relato' description='O que foi feito e o que fica para depois.' columns={1}>
          <FormTextarea
            control={control}
            name='performedActionDescription'
            label='Ação realizada'
            placeholder='O que foi feito na visita'
          />
          <FormTextarea
            control={control}
            name='followUpDetails'
            label='Acompanhamento'
            placeholder='Próximos passos combinados com o produtor'
          />
          <FormTextarea
            control={control}
            name='pendingIssuesDescription'
            label='Pendências'
            placeholder='O que ficou pendente'
          />
        </FormSection>

        {attachments && (
          <FormSection
            title='Anexos'
            description='Fotos, relatórios e outros documentos da visita.'
            columns={1}
          >
            <FormFileAttachments
              control={control}
              name='files'
              label='Anexos'
              hideLabel
              permissions={attachments}
              onUploadingChange={setIsUploading}
            />
          </FormSection>
        )}
      </div>
    </FormCard>
  );
}
