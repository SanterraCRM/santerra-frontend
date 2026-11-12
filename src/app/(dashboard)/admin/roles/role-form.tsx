'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import {
  FieldDescription,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { useCreateRole } from '@/hooks/roles/use-create-role';
import { useUpdateRole } from '@/hooks/roles/use-update-role';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { optionalTextSchema } from '@/lib/schemas';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

import { PermissionMatrix } from './permission-matrix';

const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do cargo'),
  description: optionalTextSchema,
  permissionIds: z.array(z.string()),
});

type RoleFormInput = z.input<typeof roleFormSchema>;
type RoleFormOutput = z.output<typeof roleFormSchema>;

function toFormValues(role?: Role): RoleFormInput {
  return {
    name: role?.name ?? '',
    description: role?.description ?? '',
    permissionIds: [...(role?.permissionIds ?? [])].sort(),
  };
}

type RoleFormProps = {
  role?: Role;
  permissions: Permission[];
  grantedPermissions: string[];
};

export default function RoleForm({ role, permissions, grantedPermissions }: RoleFormProps) {
  const returnToList = useReturnToList('/admin/roles');
  const { update: refreshSession } = useSession();
  const { mutate: createRole } = useCreateRole();
  const { mutate: updateRole } = useUpdateRole();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: toFormValues(role),
  });

  async function handleSave(values: RoleFormOutput) {
    setErrorMessage(null);

    try {
      if (role) {
        await updateRole(role.id, values);
      } else {
        await createRole(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('name', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    await refreshSession();
    returnToList(role ? 'Alterações salvas.' : 'Cargo cadastrado.');
  }

  return (
    <FormCard
      title='Dados do cargo'
      description='Nome, descrição e o que quem tem o cargo pode fazer.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(role)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/roles'
      createLabel='Cadastrar cargo'
    >
      <div className='grid gap-5'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='off'
          placeholder='Ex.: Vendedor'
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='Quem recebe este cargo e o que ele faz'
        />
      </div>

      <FieldSeparator />

      <FieldSet className='gap-4'>
        <FieldLegend>Permissões</FieldLegend>
        <FieldDescription>
          Marque o que quem tem este cargo pode fazer. Marcar Criar, Editar ou Excluir marca Ver
          também, e desmarcar Ver desmarca os outros da linha.
        </FieldDescription>
        <Controller
          control={control}
          name='permissionIds'
          render={({ field }) => (
            <PermissionMatrix
              permissions={permissions}
              value={field.value}
              grantedPermissions={grantedPermissions}
              onChange={field.onChange}
            />
          )}
        />
      </FieldSet>
    </FormCard>
  );
}
