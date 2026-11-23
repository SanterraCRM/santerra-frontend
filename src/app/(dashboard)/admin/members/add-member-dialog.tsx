'use client';

import { UserRoundPlus } from 'lucide-react';

import { FormInput } from '@/components/form/form-input';
import { type FormMultiSelectOption, FormMultiSelect } from '@/components/form/form-multi-select';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';

import { useAddMemberFlow } from './use-add-member-flow';

const ADD_MEMBER_FORM_ID = 'add-member-form';

type AddMemberDialogProps = {
  roleOptions: FormMultiSelectOption[] | null;
};

export function AddMemberDialog({ roleOptions }: AddMemberDialogProps) {
  const { control, isOpen, isSubmitting, errorMessage, changeOpen, submit } = useAddMemberFlow();

  return (
    <Modal
      title='Adicionar à equipe'
      description='A pessoa entra na empresa na hora, sem convite por e-mail. Se o e-mail já tiver conta, ela acessa com a senha que já usa. Se não tiver, informe o nome e uma senha inicial para criar a conta.'
      open={isOpen}
      onOpenChange={changeOpen}
      trigger={
        <Button variant='outline'>
          <UserRoundPlus />
          Adicionar membro
        </Button>
      }
      actions={
        <Button
          type='submit'
          form={ADD_MEMBER_FORM_ID}
          loading={isSubmitting}
          loadingText='Adicionando...'
        >
          Adicionar membro
        </Button>
      }
    >
      <form id={ADD_MEMBER_FORM_ID} noValidate onSubmit={submit} className='flex flex-col gap-5'>
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
        <FormInput
          control={control}
          name='name'
          label='Nome'
          autoComplete='off'
          description='Só para quem ainda não tem conta.'
        />
        <FormInput
          control={control}
          name='password'
          label='Senha inicial'
          type='password'
          autoComplete='new-password'
          description={`Só para quem ainda não tem conta, com pelo menos ${MIN_PASSWORD_LENGTH} caracteres. Passe a senha para a pessoa por um canal seguro; ela pode trocá-la em Minha conta.`}
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
