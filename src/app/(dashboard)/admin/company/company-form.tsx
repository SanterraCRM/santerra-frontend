'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormTextarea } from '@/components/form/form-textarea';
import { useUpdateCompany } from '@/hooks/company/use-update-company';
import { getApiErrorMessage } from '@/lib/api';
import { optionalTextSchema } from '@/lib/schemas';
import type { Company } from '@/types/company';

const companyFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da empresa'),
  description: optionalTextSchema,
});

type CompanyFormInput = z.input<typeof companyFormSchema>;
type CompanyFormOutput = z.output<typeof companyFormSchema>;

function toFormValues(company: Pick<Company, 'name' | 'description'>): CompanyFormInput {
  return {
    name: company.name,
    description: company.description ?? '',
  };
}

type CompanyFormProps = {
  company: Company;
};

export default function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter();
  const { update: refreshSession } = useSession();
  const { mutate: updateCompany } = useUpdateCompany();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: toFormValues(company),
  });

  async function handleSave(values: CompanyFormOutput) {
    setErrorMessage(null);
    let saved: Company;

    try {
      saved = await updateCompany(values);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    await refreshSession();
    reset(toFormValues(saved));
    toast.success('Alterações salvas.');
    router.refresh();
  }

  return (
    <FormCard
      title='Dados da empresa'
      description='Nome e descrição da empresa.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin'
      createLabel='Salvar'
    >
      <div className='grid gap-5'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='organization'
          placeholder='Ex.: Agro Vale Verde'
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='O que a empresa faz'
        />
      </div>
    </FormCard>
  );
}
