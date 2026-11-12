'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { ActionCard } from '@/components/crud/action-card';
import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { Button } from '@/components/ui/button';
import { useCreateEmployee } from '@/hooks/employees/use-create-employee';
import { useUpdateEmployee } from '@/hooks/employees/use-update-employee';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { toDateInputValue } from '@/lib/format';
import { optionalDateSchema, optionalTextSchema } from '@/lib/schemas';
import type { EmployeeInput } from '@/types/employee';
import type { Member } from '@/types/member';
import type { PersonEmployee } from '@/types/person';

export const employeeFieldsSchema = z.object({
  hiredAt: optionalDateSchema,
  terminatedAt: optionalDateSchema,
  userCompanyId: optionalTextSchema,
});

type EmployeeFieldsInput = z.input<typeof employeeFieldsSchema>;
type EmployeeFieldsOutput = z.output<typeof employeeFieldsSchema>;
type MemberOption = Pick<Member, 'id' | 'name' | 'email'>;

export function checkEmployeeFields(values: EmployeeFieldsOutput, context: z.core.$RefinementCtx) {
  if (values.hiredAt && values.terminatedAt && values.terminatedAt < values.hiredAt) {
    context.addIssue({
      code: 'custom',
      path: ['terminatedAt'],
      message: 'O desligamento não pode ser antes da admissão',
    });
  }
}

const employeeFormSchema = employeeFieldsSchema.superRefine(checkEmployeeFields);

export function toEmployeeFormValues(employee?: PersonEmployee | null): EmployeeFieldsInput {
  return {
    hiredAt: employee?.hiredAt ? toDateInputValue(employee.hiredAt) : '',
    terminatedAt: employee?.terminatedAt ? toDateInputValue(employee.terminatedAt) : '',
    userCompanyId: employee?.member?.id ?? '',
  };
}

export function toEmployeeInput(values: EmployeeFieldsOutput): EmployeeInput {
  return {
    hiredAt: values.hiredAt,
    terminatedAt: values.terminatedAt,
    userCompanyId: values.userCompanyId,
  };
}

type EmployeeFieldsProps = {
  members?: MemberOption[];
  currentMember?: MemberOption | null;
  showTermination?: boolean;
};

export function EmployeeFields({
  members,
  currentMember,
  showTermination = false,
}: EmployeeFieldsProps) {
  const { control } = useFormContext<EmployeeFieldsInput>();
  const hiredAt = useWatch({ control, name: 'hiredAt' });
  const memberOptions = members ?? (currentMember ? [currentMember] : []);

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
      {memberOptions.length > 0 && (
        <FormSelect
          control={control}
          name='userCompanyId'
          label='Membro da equipe'
          options={memberOptions.map(({ id, name, email }) => ({
            value: id,
            label: `${name} (${email})`,
          }))}
          emptyOption='Sem vínculo'
          disabled={!members}
          description={
            members
              ? 'Vincule quando o funcionário também acessa o sistema.'
              : 'Só quem tem acesso à equipe pode trocar o vínculo.'
          }
          className={showTermination ? 'sm:col-span-2' : undefined}
        />
      )}
    </div>
  );
}

type EmployeeFormProps = {
  personId: string;
  listHref: string;
  employee?: PersonEmployee;
  members?: MemberOption[];
  action?: ReactNode;
};

export default function EmployeeForm({
  personId,
  listHref,
  employee,
  members,
  action,
}: EmployeeFormProps) {
  const returnToList = useReturnToList(listHref);
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const [isOpen, setIsOpen] = useState(Boolean(employee));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: toEmployeeFormValues(employee),
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
      if (isApiErrorWithCode(error, 'MEMBER_ALREADY_LINKED')) {
        setError('userCompanyId', { message: error.message }, { shouldFocus: true });
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
        description='Admissão, desligamento e membro da equipe.'
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
          members={members}
          currentMember={employee?.member}
          showTermination={Boolean(employee)}
        />
      </FormCard>
    </FormProvider>
  );
}
