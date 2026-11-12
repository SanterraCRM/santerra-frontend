'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { type FormCheckboxOption, FormCheckboxGroup } from '@/components/form/form-checkbox-group';
import { FormSwitch } from '@/components/form/form-switch';
import { useUpdateMember } from '@/hooks/members/use-update-member';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage } from '@/lib/api';
import type { MemberDetails } from '@/types/member';

const memberFormSchema = z.object({
  active: z.boolean(),
  roleIds: z.array(z.string()),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

type MemberFormProps = {
  member: MemberDetails;
  roleOptions: FormCheckboxOption[] | null;
};

export default function MemberForm({ member, roleOptions }: MemberFormProps) {
  const returnToList = useReturnToList('/admin/members');
  const { mutate: updateMember } = useUpdateMember();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: { active: member.active, roleIds: member.roleIds },
  });

  async function handleSave(values: MemberFormValues) {
    setErrorMessage(null);

    try {
      await updateMember(member.id, roleOptions ? values : { active: values.active });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList('Alterações salvas.');
  }

  return (
    <FormCard
      title='Acesso à empresa'
      description='Se a pessoa pode entrar na empresa e o que ela pode fazer.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/members'
      createLabel='Salvar'
    >
      <div className='grid gap-6'>
        <FormSwitch
          control={control}
          name='active'
          label='Ativo'
          description='Desativado, o membro perde o acesso na hora e volta a entrar só quando for reativado.'
        />
        {roleOptions && (
          <FormCheckboxGroup
            control={control}
            name='roleIds'
            label='Cargos'
            description='As permissões do membro são a soma das permissões dos cargos marcados.'
            options={roleOptions}
            emptyMessage='Nenhum cargo cadastrado. Crie cargos em Configurações › Cargos.'
          />
        )}
      </div>
    </FormCard>
  );
}
