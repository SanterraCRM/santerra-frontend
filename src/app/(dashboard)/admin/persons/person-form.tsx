'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness, type LucideIcon, Tractor } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormRadioCards } from '@/components/form/form-radio-cards';
import { FieldDescription, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { useCreatePerson } from '@/hooks/persons/use-create-person';
import { useUpdatePerson } from '@/hooks/persons/use-update-person';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { maskNationalId, maskPhone } from '@/lib/format';
import {
  optionalEmailSchema,
  optionalNationalIdSchema,
  optionalPhoneSchema,
} from '@/lib/schemas';
import type { Member } from '@/types/member';
import type { CreatePersonInput, Person, PersonInput, PersonType } from '@/types/person';
import type { Potential } from '@/types/potential';

import {
  checkEmployeeFields,
  EmployeeFields,
  employeeFieldsSchema,
  toEmployeeFormValues,
} from './employee-form';
import { PERSON_TYPE_LABELS } from './persons-config';
import {
  checkProducerFields,
  ProducerFields,
  producerFieldsSchema,
  toProducerFormValues,
  toProducerInput,
} from './producer-form';

const PERSON_TYPE_CHOICES: Record<PersonType, { description: string; icon: LucideIcon }> = {
  employee: {
    description: 'Faz parte da equipe da empresa.',
    icon: BriefcaseBusiness,
  },
  producer: {
    description: 'Produtor rural atendido pela empresa.',
    icon: Tractor,
  },
};

const PERSON_TYPE_FIELDS_DESCRIPTIONS: Record<PersonType, string> = {
  employee: 'Data de admissão e membro da equipe.',
  producer: 'Potencial, cultura principal, área e endereço.',
};

function getPersonFormSchema(isCreating: boolean) {
  return z
    .object({
      name: z.string().trim().min(1, 'Informe o nome'),
      nationalId: optionalNationalIdSchema,
      phoneNumber: optionalPhoneSchema,
      email: optionalEmailSchema,
      type: z.enum(['employee', 'producer']).optional(),
      ...producerFieldsSchema.shape,
      ...employeeFieldsSchema.shape,
    })
    .superRefine((values, context) => {
      if (!isCreating) {
        return;
      }

      if (!values.type) {
        context.addIssue({ code: 'custom', path: ['type'], message: 'Selecione o tipo de pessoa' });
      }

      if (values.type === 'producer') {
        checkProducerFields(values, context);
      }

      if (values.type === 'employee') {
        checkEmployeeFields(values, context);
      }
    });
}

const createPersonFormSchema = getPersonFormSchema(true);
const updatePersonFormSchema = getPersonFormSchema(false);

type PersonFormInput = z.input<typeof createPersonFormSchema>;
type PersonFormOutput = z.output<typeof createPersonFormSchema>;

function toFormValues(person: Person | undefined, personTypes: PersonType[]): PersonFormInput {
  return {
    name: person?.name ?? '',
    nationalId: person?.nationalId ? maskNationalId(person.nationalId) : '',
    phoneNumber: person?.phoneNumber ? maskPhone(person.phoneNumber) : '',
    email: person?.email ?? '',
    type: personTypes.length === 1 ? personTypes[0] : undefined,
    ...toProducerFormValues(),
    ...toEmployeeFormValues(),
  };
}

function toPersonInput({ name, nationalId, phoneNumber, email }: PersonFormOutput): PersonInput {
  return { name, nationalId, phoneNumber, email };
}

function toCreatePersonInput(values: PersonFormOutput): CreatePersonInput {
  if (values.type === 'producer') {
    return { ...toPersonInput(values), producer: toProducerInput(values) };
  }

  return {
    ...toPersonInput(values),
    employee: { hiredAt: values.hiredAt, userCompanyId: values.userCompanyId },
  };
}

type PersonFormProps = {
  listHref: string;
  person?: Person;
  personTypes?: PersonType[];
  fixedType?: PersonType;
  potentials?: Pick<Potential, 'id' | 'name'>[];
  members?: Pick<Member, 'id' | 'name' | 'email'>[];
  canCreatePotential?: boolean;
};

function getCreatedMessage(fixedType: PersonType | undefined): string {
  return fixedType ? `${PERSON_TYPE_LABELS[fixedType]} cadastrado.` : 'Pessoa cadastrada.';
}

function getFormDescription(person: Person | undefined, fixedType: PersonType | undefined): string {
  if (person) {
    return 'Nome, documento e formas de contato.';
  }

  if (fixedType) {
    return `Nome, documento, contato e os dados de ${PERSON_TYPE_LABELS[fixedType].toLowerCase()}.`;
  }

  return 'Tipo, nome, documento, contato e os dados do tipo escolhido.';
}

export default function PersonForm({
  listHref,
  person,
  personTypes = [],
  fixedType,
  potentials = [],
  members,
  canCreatePotential = false,
}: PersonFormProps) {
  const returnToList = useReturnToList(listHref);
  const { mutate: createPerson } = useCreatePerson();
  const { mutate: updatePerson } = useUpdatePerson();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(person ? updatePersonFormSchema : createPersonFormSchema),
    defaultValues: toFormValues(person, fixedType ? [fixedType] : personTypes),
  });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = form;
  const selectedType = useWatch({ control, name: 'type' });

  async function handleSave(values: PersonFormOutput) {
    setErrorMessage(null);

    try {
      if (person) {
        await updatePerson(person.id, toPersonInput(values));
      } else {
        await createPerson(toCreatePersonInput(values));
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'MEMBER_ALREADY_LINKED')) {
        setError('userCompanyId', { message: error.message }, { shouldFocus: true });
        return;
      }

      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('nationalId', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(person ? 'Alterações salvas.' : getCreatedMessage(fixedType));
  }

  return (
    <FormProvider {...form}>
      <FormCard
        title='Dados da pessoa'
        description={getFormDescription(person, fixedType)}
        onSubmit={handleSubmit(handleSave)}
        errorMessage={errorMessage}
        isEditing={Boolean(person)}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => reset()}
        cancelHref={listHref}
        createLabel={fixedType ? `Cadastrar ${PERSON_TYPE_LABELS[fixedType].toLowerCase()}` : 'Cadastrar pessoa'}
      >
        {!person && !fixedType && (
          <>
            <FormRadioCards
              control={control}
              name='type'
              label='Tipo de pessoa'
              required
              options={personTypes.map((type) => ({
                value: type,
                label: PERSON_TYPE_LABELS[type],
                ...PERSON_TYPE_CHOICES[type],
              }))}
            />

            <FieldSeparator />
          </>
        )}

        <div className='grid gap-5 sm:grid-cols-2'>
          <FormInput
            control={control}
            name='name'
            label='Nome'
            required
            autoComplete='name'
            placeholder='Nome completo ou razão social'
            className='sm:col-span-2'
          />
          <FormInput
            control={control}
            name='nationalId'
            label='CPF ou CNPJ'
            inputMode='numeric'
            placeholder='000.000.000-00'
            mask={maskNationalId}
          />
          <FormInput
            control={control}
            name='phoneNumber'
            label='Telefone'
            type='tel'
            autoComplete='tel-national'
            placeholder='(00) 00000-0000'
            mask={maskPhone}
          />
          <FormInput
            control={control}
            name='email'
            label='E-mail'
            type='email'
            autoComplete='email'
            placeholder='nome@exemplo.com'
            className='sm:col-span-2'
          />
        </div>

        {!person && selectedType && (
          <>
            <FieldSeparator />

            <FieldSet className='gap-5'>
              <FieldLegend>Dados de {PERSON_TYPE_LABELS[selectedType].toLowerCase()}</FieldLegend>
              <FieldDescription>{PERSON_TYPE_FIELDS_DESCRIPTIONS[selectedType]}</FieldDescription>
              {selectedType === 'producer' ? (
                <ProducerFields potentials={potentials} canCreatePotential={canCreatePotential} />
              ) : (
                <EmployeeFields members={members} />
              )}
            </FieldSet>
          </>
        )}
      </FormCard>
    </FormProvider>
  );
}
