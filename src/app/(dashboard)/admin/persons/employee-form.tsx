'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { ActionCard } from '@/components/crud/action-card';
import { FormAsyncCombobox } from '@/components/form/form-async-combobox';
import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormMultiSelect } from '@/components/form/form-multi-select';
import { FormSwitch } from '@/components/form/form-switch';
import { Button } from '@/components/ui/button';
import { useCreateEmployee } from '@/hooks/employees/use-create-employee';
import { useUpdateEmployee } from '@/hooks/employees/use-update-employee';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { toDateInputValue } from '@/lib/format';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import type { RoleOption } from '@/lib/permissions';
import { optionalDateSchema, optionalOptionSchema } from '@/lib/schemas';
import type { EmployeeInput } from '@/types/employee';
import type { PersonEmployee } from '@/types/person';

export type EmployeeAccessOptions = {
  companyName: string;
  roleOptions: RoleOption[];
};

export const employeeFieldsSchema = z.object({
  hiredAt: optionalDateSchema,
  terminatedAt: optionalDateSchema,
  userCompanyId: optionalOptionSchema,
  hasAccess: z.boolean().nullable(),
  accessPassword: z.string(),
  accessRoleIds: z.array(z.string()),
});

type EmployeeFieldsInput = z.input<typeof employeeFieldsSchema>;
type EmployeeFieldsOutput = z.output<typeof employeeFieldsSchema>;

export function checkEmployeeFields(values: EmployeeFieldsOutput, context: z.core.$RefinementCtx) {
  if (values.hiredAt && values.terminatedAt && values.terminatedAt < values.hiredAt) {
    context.addIssue({
      code: 'custom',
      path: ['terminatedAt'],
      message: 'O desligamento não pode ser antes da admissão',
    });
  }

  if (!isCreatingAccess(values)) {
    return;
  }

  if (!values.accessPassword) {
    context.addIssue({
      code: 'custom',
      path: ['accessPassword'],
      message: 'Informe a senha inicial do acesso',
    });
  } else if (values.accessPassword.length < MIN_PASSWORD_LENGTH) {
    context.addIssue({
      code: 'custom',
      path: ['accessPassword'],
      message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
    });
  }

  if (values.accessRoleIds.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['accessRoleIds'],
      message: 'Escolha pelo menos um cargo para o acesso',
    });
  }
}

export function isCreatingAccess(values: Pick<EmployeeFieldsOutput, 'hasAccess' | 'userCompanyId'>) {
  return values.hasAccess === true && !values.userCompanyId;
}

const employeeFormSchema = employeeFieldsSchema.superRefine(checkEmployeeFields);

export function toEmployeeFormValues(
  employee?: PersonEmployee | null,
  canCreateAccess = false,
): EmployeeFieldsInput {
  return {
    hiredAt: employee?.hiredAt ? toDateInputValue(employee.hiredAt) : '',
    terminatedAt: employee?.terminatedAt ? toDateInputValue(employee.terminatedAt) : '',
    userCompanyId: employee?.member
      ? {
          value: employee.member.id,
          label: employee.member.name,
          description: employee.member.email,
        }
      : null,
    hasAccess: canCreateAccess ? Boolean(employee?.member) : null,
    accessPassword: '',
    accessRoleIds: [],
  };
}

export function toEmployeeInput(values: EmployeeFieldsOutput): EmployeeInput {
  const dates = { hiredAt: values.hiredAt, terminatedAt: values.terminatedAt };

  if (values.hasAccess === null) {
    return { ...dates, userCompanyId: values.userCompanyId };
  }

  if (!isCreatingAccess(values)) {
    return { ...dates, userCompanyId: values.hasAccess ? values.userCompanyId : null };
  }

  return {
    ...dates,
    userCompanyId: null,
    access: { password: values.accessPassword, roleIds: values.accessRoleIds },
  };
}

type EmployeeFieldError = {
  field: 'userCompanyId';
  message: string;
};

export function getEmployeeFieldError(
  error: unknown,
  canSearchMembers: boolean,
): EmployeeFieldError | null {
  if (isApiErrorWithCode(error, 'MEMBER_ALREADY_LINKED')) {
    return { field: 'userCompanyId', message: error.message };
  }

  if (isApiErrorWithCode(error, 'ALREADY_MEMBER') && canSearchMembers) {
    return {
      field: 'userCompanyId',
      message: 'Este e-mail já é de alguém da equipe. Escolha a pessoa na lista.',
    };
  }

  return null;
}

type EmployeeAccessFieldsProps = {
  access: EmployeeAccessOptions;
  canSearchMembers: boolean;
  hasCurrentMember: boolean;
  personEmail?: string | null;
  isEmailEditable: boolean;
};

function getAccessDescription(
  { access, hasCurrentMember, personEmail, isEmailEditable }: EmployeeAccessFieldsProps,
  hasAccess: boolean,
): string {
  if (hasCurrentMember && !hasAccess) {
    return 'Desligar só desfaz o vínculo: a pessoa continua na Equipe. Para tirar o acesso, remova-a em Equipe.';
  }

  if (!personEmail && !isEmailEditable) {
    return 'Cadastre o e-mail da pessoa em Dados da pessoa para dar acesso.';
  }

  return `A pessoa entra em ${access.companyName} com o e-mail${personEmail ? ` ${personEmail}` : ' dela'}. Desligado, ela não acessa o sistema.`;
}

function EmployeeAccessFields(props: EmployeeAccessFieldsProps) {
  const { access, canSearchMembers, hasCurrentMember, personEmail, isEmailEditable } = props;
  const { control } = useFormContext<EmployeeFieldsInput>();
  const hasAccess = useWatch({ control, name: 'hasAccess' }) === true;
  const member = useWatch({ control, name: 'userCompanyId' });
  const isSwitchLocked = !hasAccess && !personEmail && !isEmailEditable;

  return (
    <>
      <FormSwitch
        control={control}
        name='hasAccess'
        label='Pode entrar no sistema'
        description={getAccessDescription(props, hasAccess)}
        disabled={isSwitchLocked}
        className='sm:col-span-2'
      />
      {hasAccess && (canSearchMembers || hasCurrentMember) && (
        <FormAsyncCombobox
          control={control}
          name='userCompanyId'
          label='Acesso'
          source='members'
          emptyOption='Criar um acesso novo'
          searchPlaceholder='Buscar pelo nome ou e-mail'
          disabled={!canSearchMembers}
          description={
            canSearchMembers
              ? 'Crie um acesso novo com o e-mail da pessoa ou escolha alguém que já está na equipe.'
              : 'Só quem tem acesso à equipe pode trocar o vínculo.'
          }
          className='sm:col-span-2'
        />
      )}
      {hasAccess && !member && (
        <>
          <FormInput
            control={control}
            name='accessPassword'
            label='Senha inicial'
            type='password'
            autoComplete='new-password'
            required
            description={`Com pelo menos ${MIN_PASSWORD_LENGTH} caracteres. Se o e-mail já tiver conta, a pessoa continua entrando com a senha que já usa.`}
            className='sm:col-span-2'
          />
          <FormMultiSelect
            control={control}
            name='accessRoleIds'
            label='Cargos'
            options={access.roleOptions}
            placeholder='Selecione os cargos'
            searchPlaceholder='Buscar cargo…'
            emptyMessage='Nenhum cargo cadastrado.'
            required
            description='A pessoa entra com as permissões dos cargos escolhidos.'
            className='sm:col-span-2'
          />
        </>
      )}
    </>
  );
}

type EmployeeFieldsProps = {
  canSearchMembers?: boolean;
  hasCurrentMember?: boolean;
  showTermination?: boolean;
  access?: EmployeeAccessOptions | null;
  personEmail?: string | null;
  isEmailEditable?: boolean;
};

export function EmployeeFields({
  canSearchMembers = false,
  hasCurrentMember = false,
  showTermination = false,
  access = null,
  personEmail,
  isEmailEditable = false,
}: EmployeeFieldsProps) {
  const { control } = useFormContext<EmployeeFieldsInput>();
  const hiredAt = useWatch({ control, name: 'hiredAt' });

  return (
    <div className='grid gap-5 sm:grid-cols-2'>
      <FormInput control={control} name='hiredAt' label='Data de admissão' type='date' />
      {showTermination && (
        <FormInput
          control={control}
          name='terminatedAt'
          label='Data de desligamento'
          type='date'
          min={hiredAt || undefined}
          description='Preencha quando a pessoa sair da empresa.'
        />
      )}
      {access ? (
        <EmployeeAccessFields
          access={access}
          canSearchMembers={canSearchMembers}
          hasCurrentMember={hasCurrentMember}
          personEmail={personEmail}
          isEmailEditable={isEmailEditable}
        />
      ) : (
        (canSearchMembers || hasCurrentMember) && (
          <FormAsyncCombobox
            control={control}
            name='userCompanyId'
            label='Membro da equipe'
            source='members'
            emptyOption='Sem vínculo'
            searchPlaceholder='Buscar pelo nome ou e-mail'
            disabled={!canSearchMembers}
            description={
              canSearchMembers
                ? 'Vincule quando o funcionário também acessa o sistema.'
                : 'Só quem tem acesso à equipe pode trocar o vínculo.'
            }
            className={showTermination ? 'sm:col-span-2' : undefined}
          />
        )
      )}
    </div>
  );
}

type EmployeeFormProps = {
  personId: string;
  personEmail: string | null;
  listHref: string;
  employee?: PersonEmployee;
  canSearchMembers?: boolean;
  access?: EmployeeAccessOptions | null;
  action?: ReactNode;
};

export default function EmployeeForm({
  personId,
  personEmail,
  listHref,
  employee,
  canSearchMembers = false,
  access = null,
  action,
}: EmployeeFormProps) {
  const returnToList = useReturnToList(listHref);
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const [isOpen, setIsOpen] = useState(Boolean(employee));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: toEmployeeFormValues(employee, Boolean(access)),
  });
  const {
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    if (isOpen && !employee) {
      setFocus('hiredAt');
    }
  }, [isOpen, employee, setFocus]);

  async function handleSave(values: EmployeeFieldsOutput) {
    setErrorMessage(null);

    try {
      if (employee) {
        await updateEmployee(employee.id, toEmployeeInput(values));
      } else {
        await createEmployee(personId, toEmployeeInput(values));
      }
    } catch (error) {
      const fieldError = getEmployeeFieldError(error, canSearchMembers);

      if (fieldError) {
        setError(fieldError.field, { message: fieldError.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(employee ? 'Alterações salvas.' : 'Funcionário cadastrado.');
  }

  if (!isOpen) {
    return (
      <ActionCard
        title='Funcionário'
        description='Esta pessoa não é funcionário da empresa.'
        action={
          <Button variant='outline' onClick={() => setIsOpen(true)}>
            <BriefcaseBusiness />
            Tornar funcionário
          </Button>
        }
      />
    );
  }

  return (
    <FormProvider {...form}>
      <FormCard
        title='Dados de funcionário'
        description={
          access
            ? 'Admissão, desligamento e acesso ao sistema.'
            : 'Admissão, desligamento e membro da equipe.'
        }
        action={action}
        onSubmit={handleSubmit(handleSave)}
        errorMessage={errorMessage}
        isEditing={Boolean(employee)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => reset()}
        onCancel={() => {
          reset();
          setErrorMessage(null);
          setIsOpen(false);
        }}
        createLabel='Tornar funcionário'
      >
        <EmployeeFields
          canSearchMembers={canSearchMembers}
          hasCurrentMember={Boolean(employee?.member)}
          showTermination={Boolean(employee)}
          access={access}
          personEmail={personEmail}
        />
      </FormCard>
    </FormProvider>
  );
}
