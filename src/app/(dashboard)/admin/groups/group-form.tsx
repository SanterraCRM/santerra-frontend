'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreateGroup } from '@/hooks/groups/use-create-group';
import { useUpdateGroup } from '@/hooks/groups/use-update-group';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { optionalTextSchema } from '@/lib/schemas';
import type { Group } from '@/types/group';

const groupFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do grupo'),
  description: optionalTextSchema,
});

type GroupFormInput = z.input<typeof groupFormSchema>;
type GroupFormOutput = z.output<typeof groupFormSchema>;

function toFormValues(group?: Group): GroupFormInput {
  return {
    name: group?.name ?? '',
    description: group?.description ?? '',
  };
}

type GroupFormProps = {
  group?: Group;
};

export default function GroupForm({ group }: GroupFormProps) {
  const returnToList = useReturnToList('/admin/groups');
  const { mutate: createGroup } = useCreateGroup();
  const { mutate: updateGroup } = useUpdateGroup();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(groupFormSchema),
    defaultValues: toFormValues(group),
  });

  async function handleSave(values: GroupFormOutput) {
    setErrorMessage(null);

    try {
      if (group) {
        await updateGroup(group.id, values);
      } else {
        await createGroup(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('name', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(group ? 'Alterações salvas.' : 'Grupo cadastrado.');
  }

  return (
    <FormCard
      title='Dados do grupo'
      description='Nome e descrição do grupo de produtos.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(group)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/groups'
      createLabel='Cadastrar grupo'
    >
      <div className='grid gap-5'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='off'
          placeholder='Ex.: Sementes'
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='Que tipo de produto entra neste grupo'
        />
      </div>
    </FormCard>
  );
}
