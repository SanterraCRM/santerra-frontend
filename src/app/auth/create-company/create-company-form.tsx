'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, BuildingIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useCreateCompany } from '@/hooks/auth/use-create-company';
import { useSelectCompany } from '@/hooks/auth/use-select-company';
import { getApiErrorMessage } from '@/lib/api';
import { DEFAULT_CALLBACK_URL, SELECT_COMPANY_PATH } from '@/lib/callback-url';
import { optionalTextSchema } from '@/lib/schemas';

const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da empresa'),
  description: optionalTextSchema,
});

type CreateCompanyInput = z.input<typeof createCompanySchema>;
type CreateCompanyOutput = z.output<typeof createCompanySchema>;

type CreateCompanyFormProps = {
  hasCompany: boolean;
};

export default function CreateCompanyForm({ hasCompany }: CreateCompanyFormProps) {
  const { status } = useSession();
  const { mutate: createCompany } = useCreateCompany();
  const { mutate: selectCompany } = useSelectCompany();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyInput, unknown, CreateCompanyOutput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: '', description: '' },
  });

  async function handleCreate(values: CreateCompanyOutput) {
    setErrorMessage(null);
    let companyId: string;

    try {
      ({ id: companyId } = await createCompany(values));
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Não foi possível criar a empresa agora. Tente novamente.'),
      );
      return;
    }

    setIsRedirecting(true);

    try {
      await selectCompany(companyId);
    } catch {
      window.location.assign(SELECT_COMPANY_PATH);
      return;
    }

    window.location.assign(DEFAULT_CALLBACK_URL);
  }

  return (
    <>
      <AuthHeader
        icon={<BuildingIcon className='size-7' />}
        title='Criar nova empresa'
        description='Você será o dono da empresa, com acesso a tudo. Depois, é só convidar a sua equipe.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleCreate)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

        <TextField
          label='Nome da empresa'
          autoComplete='organization'
          placeholder='Ex.: Agro Vale Verde'
          icon={<BuildingIcon className='size-5' />}
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          label='Descrição (opcional)'
          autoComplete='off'
          placeholder='O que a empresa faz'
          error={errors.description?.message}
          {...register('description')}
        />

        <Button
          type='submit'
          size='xl'
          className='mt-2 w-full'
          disabled={status !== 'authenticated'}
          loading={isSubmitting || isRedirecting}
          loadingText={isRedirecting ? 'Entrando...' : 'Criando...'}
        >
          Criar empresa
        </Button>
      </form>

      <Link
        href={hasCompany ? DEFAULT_CALLBACK_URL : SELECT_COMPANY_PATH}
        className='mx-auto mt-8 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
      >
        <ArrowLeftIcon className='size-4' />
        {hasCompany ? 'Voltar ao painel' : 'Voltar para a escolha de empresa'}
      </Link>
    </>
  );
}
