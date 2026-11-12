'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { BuildingIcon, CheckIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { getInitials } from '@/lib/initials';

import { StepActions } from './step-actions';

const companyStepSchema = z.object({
  companyName: z.string().trim().min(1, 'Informe o nome da empresa'),
});

export type CompanyValues = z.output<typeof companyStepSchema>;

type CompanyStepProps = {
  name: string;
  email: string;
  defaultValues: CompanyValues;
  error: string | null;
  isRedirecting: boolean;
  onBack: (values: CompanyValues) => void;
  onSubmit: (values: CompanyValues) => Promise<void>;
};

export function CompanyStep({
  name,
  email,
  defaultValues,
  error,
  isRedirecting,
  onBack,
  onSubmit,
}: CompanyStepProps) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyStepSchema),
    defaultValues,
  });

  return (
    <>
      <AuthHeader
        title='Sua empresa'
        description='Último passo! Você será o administrador da empresa e poderá convidar sua equipe depois.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {error && <Alert variant='error'>{error}</Alert>}

        <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/[0.03]'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-1 ring-brand-100'>
            {getInitials(name)}
          </span>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-slate-900'>{name}</p>
            <p className='truncate text-[13px] text-slate-500'>{email}</p>
          </div>
          <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100'>
            <CheckIcon className='size-3.5' strokeWidth={2.6} />
            Confirmado
          </span>
        </div>

        <TextField
          label='Nome da empresa'
          autoComplete='organization'
          placeholder='Nome da sua empresa'
          icon={<BuildingIcon />}
          autoFocus
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <StepActions
          submitLabel='Criar conta'
          onBack={() => onBack(getValues())}
          loading={isSubmitting || isRedirecting}
          loadingText={isRedirecting ? 'Entrando...' : 'Criando conta...'}
        />
      </form>
    </>
  );
}
