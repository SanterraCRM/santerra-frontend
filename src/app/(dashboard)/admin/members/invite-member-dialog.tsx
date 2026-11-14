'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormInput } from '@/components/form/form-input';
import { type FormMultiSelectOption, FormMultiSelect } from '@/components/form/form-multi-select';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useCreateInvitation } from '@/hooks/invitations/use-create-invitation';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { emailSchema } from '@/lib/schemas';

const INVITE_FORM_ID = 'invite-member-form';

const inviteFormSchema = z.object({
  email: emailSchema,
  roleIds: z.array(z.string()),
});

type InviteFormValues = z.output<typeof inviteFormSchema>;

type InviteMemberDialogProps = {
  roleOptions: FormMultiSelectOption[] | null;
};

export function InviteMemberDialog({ roleOptions }: InviteMemberDialogProps) {
  const router = useRouter();
  const { mutate: createInvitation } = useCreateInvitation();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', roleIds: [] },
  });

  function handleOpenChange(open: boolean) {
    if (isSubmitting) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      reset();
      setErrorMessage(null);
    }
  }

  async function handleInvite(values: InviteFormValues) {
    setErrorMessage(null);

    try {
      await createInvitation(values);
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('email', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível enviar o convite agora. Tente novamente.'));
      return;
    }

    handleOpenChange(false);
    toast.success(`Convite enviado para ${values.email}.`);
    router.refresh();
  }

  return (
    <Modal
      title='Convidar para a equipe'
      description='A pessoa recebe um link por e-mail para entrar na empresa, que vale por 7 dias. Se o e-mail já tiver um convite pendente, ele é trocado por este, então serve também para reenviar.'
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button>
          <UserPlus />
          Convidar
        </Button>
      }
      actions={
        <Button type='submit' form={INVITE_FORM_ID} loading={isSubmitting} loadingText='Enviando...'>
          Enviar convite
        </Button>
      }
    >
      <form
        id={INVITE_FORM_ID}
        noValidate
        onSubmit={handleSubmit(handleInvite)}
        className='flex flex-col gap-5'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}
        <FormInput
          control={control}
          name='email'
          label='E-mail'
          type='email'
          required
          autoComplete='off'
          placeholder='nome@exemplo.com'
        />
        {roleOptions && (
          <FormMultiSelect
            control={control}
            name='roleIds'
            label='Cargos'
            options={roleOptions}
            placeholder='Selecione os cargos'
            searchPlaceholder='Buscar cargo…'
            emptyMessage='Nenhum cargo cadastrado.'
            description='A pessoa entra com as permissões dos cargos escolhidos. Sem cargo, ela entra sem permissões até receber um.'
          />
        )}
      </form>
    </Modal>
  );
}
