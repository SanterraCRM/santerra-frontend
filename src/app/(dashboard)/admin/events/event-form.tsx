'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreateEvent } from '@/hooks/events/use-create-event';
import { useUpdateEvent } from '@/hooks/events/use-update-event';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { optionalTextSchema } from '@/lib/schemas';
import type { Event } from '@/types/event';

const eventFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do evento'),
  description: optionalTextSchema,
});

type EventFormInput = z.input<typeof eventFormSchema>;
type EventFormOutput = z.output<typeof eventFormSchema>;

function toFormValues(event?: Event): EventFormInput {
  return {
    name: event?.name ?? '',
    description: event?.description ?? '',
  };
}

type EventFormProps = {
  event?: Event;
};

export default function EventForm({ event }: EventFormProps) {
  const returnToList = useReturnToList('/admin/events');
  const { mutate: createEvent } = useCreateEvent();
  const { mutate: updateEvent } = useUpdateEvent();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: toFormValues(event),
  });

  async function handleSave(values: EventFormOutput) {
    setErrorMessage(null);

    try {
      if (event) {
        await updateEvent(event.id, values);
      } else {
        await createEvent(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('name', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(event ? 'Alterações salvas.' : 'Evento cadastrado.');
  }

  return (
    <FormCard
      title='Dados do evento'
      description='Nome e descrição do evento.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(event)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/events'
      createLabel='Cadastrar evento'
    >
      <div className='grid gap-5'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='off'
          placeholder='Ex.: Dia de Campo Soja 2026'
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='O que acontece no evento e para quem ele é'
        />
      </div>
    </FormCard>
  );
}
