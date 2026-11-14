'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Power } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormInput } from '@/components/form/form-input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useDeactivateCompany } from '@/hooks/company/use-deactivate-company';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { LOGIN_ERRORS } from '@/lib/auth-errors';

const DEACTIVATE_FORM_ID = 'deactivate-company-form';

const deactivateFormSchema = z.object({
  password: z.string().min(1, 'Informe a sua senha'),
});

type DeactivateFormOutput = z.output<typeof deactivateFormSchema>;

type DeactivateCompanyDialogProps = {
  companyName: string;
  email: string;
};

export function DeactivateCompanyDialog({ companyName, email }: DeactivateCompanyDialogProps) {
  const { mutate: deactivateCompany } = useDeactivateCompany();
  const [isOpen, setIsOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(deactivateFormSchema),
    defaultValues: { password: '' },
  });
  const isBusy = isSubmitting || isLeaving;

  function handleOpenChange(open: boolean) {
    if (isBusy) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      reset();
      setErrorMessage(null);
    }
  }

  async function handleDeactivate({ password }: DeactivateFormOutput) {
    setErrorMessage(null);

    try {
      await deactivateCompany(password);
    } catch (error) {
      if (isApiErrorWithCode(error, 'INVALID_CURRENT_PASSWORD')) {
        setError('password', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(
        getApiErrorMessage(error, 'Não foi possível inativar a empresa agora. Tente novamente.'),
      );
      return;
    }

    setIsLeaving(true);
    await signOut({ callbackUrl: `/auth/login?error=${LOGIN_ERRORS.COMPANY_DEACTIVATED}` });
  }

  return (
    <Modal
      title={`Inativar ${companyName}?`}
      description='Toda a equipe perde o acesso na hora, inclusive você, e a empresa some do login e da troca de empresa. Os dados ficam guardados, e só a administração da plataforma pode reativar.'
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button variant='destructive'>
          <Power />
          Inativar empresa
        </Button>
      }
      actions={
        <Button
          type='submit'
          form={DEACTIVATE_FORM_ID}
          variant='destructive'
          loading={isBusy}
          loadingText={isLeaving ? 'Saindo...' : 'Inativando...'}
        >
          Inativar empresa
        </Button>
      }
    >
      <form
        id={DEACTIVATE_FORM_ID}
        noValidate
        onSubmit={handleSubmit(handleDeactivate)}
        className='flex flex-col gap-5'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}
        <input type='text' name='username' autoComplete='username' value={email} readOnly hidden />
        <FormInput
          control={control}
          name='password'
          label='Sua senha'
          type='password'
          required
          autoComplete='current-password'
          description='Para confirmar, digite a senha da sua conta.'
        />
      </form>
    </Modal>
  );
}
