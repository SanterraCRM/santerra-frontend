'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreatePlatformCompany } from '@/hooks/platform-companies/use-create-platform-company';
import { useUpdatePlatformCompany } from '@/hooks/platform-companies/use-update-platform-company';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithStatus } from '@/lib/api';
import { emailSchema, optionalTextSchema } from '@/lib/schemas';
import type { PlatformCompany } from '@/types/platform';

import { PLATFORM_COMPANIES_HREF } from './companies-config';

const companySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da empresa'),
  description: optionalTextSchema,
});

const newCompanySchema = companySchema.extend({ ownerEmail: emailSchema });
const editCompanySchema = companySchema.extend({ ownerEmail: z.string() });

type CompanyFormOutput = z.output<typeof newCompanySchema>;

type CompanyFormProps = {
  company?: PlatformCompany;
};

export default function CompanyForm({ company }: CompanyFormProps) {
  const returnToList = useReturnToList(PLATFORM_COMPANIES_HREF);
  const { mutate: createCompany } = useCreatePlatformCompany();
  const { mutate: updateCompany } = useUpdatePlatformCompany();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(company ? editCompanySchema : newCompanySchema),
    defaultValues: {
      name: company?.name ?? '',
      description: company?.description ?? '',
      ownerEmail: '',
    },
  });

  async function handleSave({ name, description, ownerEmail }: CompanyFormOutput) {
    setErrorMessage(null);

    try {
      if (company) {
        await updateCompany(company.id, { name, description });
      } else {
        await createCompany({ name, description, ownerEmail });
      }
    } catch (error) {
      if (!company && (isApiErrorWithStatus(error, 404) || isApiErrorWithStatus(error, 400))) {
        setError('ownerEmail', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(company ? 'Alterações salvas.' : 'Empresa criada.');
  }

  return (
    <FormCard
      title='Dados da empresa'
      description={company ? 'Nome e descrição da empresa.' : 'Nome, descrição e o dono da empresa.'}
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(company)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={PLATFORM_COMPANIES_HREF}
      createLabel='Criar empresa'
    >
      <div className='grid gap-5'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='off'
          placeholder='Ex.: Agro Vale Verde'
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='O que a empresa faz'
        />
        {!company && (
          <FormInput
            control={control}
            name='ownerEmail'
            label='E-mail do dono'
            type='email'
            required
            autoComplete='off'
            placeholder='dono@empresa.com.br'
            description='O dono entra com o cargo Administrador, com todas as permissões. Ele precisa ter conta: cadastre em Usuários antes, se ainda não tiver.'
          />
        )}
      </div>
    </FormCard>
  );
}
