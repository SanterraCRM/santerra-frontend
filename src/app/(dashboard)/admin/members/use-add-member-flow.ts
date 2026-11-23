import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCreateMember } from '@/hooks/members/use-create-member';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';
import { emailSchema } from '@/lib/schemas';
import type { CreateMemberResult } from '@/types/member';

const addMemberFormSchema = z.object({
  email: emailSchema,
  name: z.string().trim(),
  password: z
    .string()
    .refine(
      (value) => !value || value.length >= MIN_PASSWORD_LENGTH,
      `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
    ),
  roleIds: z.array(z.string()),
});

type AddMemberFormValues = z.output<typeof addMemberFormSchema>;

function getAddedMessage({ member, accountCreated }: CreateMemberResult): string {
  return accountCreated
    ? `${member.name} entrou na equipe com uma conta nova. Passe a senha inicial para a pessoa.`
    : `${member.name} entrou na equipe e acessa com a senha que já usava.`;
}

export function useAddMemberFlow() {
  const router = useRouter();
  const { mutate: createMember } = useCreateMember();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: { email: '', name: '', password: '', roleIds: [] },
  });
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  function close() {
    setIsOpen(false);
    reset();
    setErrorMessage(null);
  }

  function changeOpen(open: boolean) {
    if (isSubmitting) {
      return;
    }

    if (open) {
      setIsOpen(true);
      return;
    }

    close();
  }

  function showMissingAccountDetails({ name, password }: AddMemberFormValues): boolean {
    if (name && password) {
      return false;
    }

    if (!name) {
      setError('name', { message: 'Informe o nome para criar a conta.' }, { shouldFocus: true });
    }

    if (!password) {
      setError(
        'password',
        { message: 'Informe a senha inicial para criar a conta.' },
        { shouldFocus: Boolean(name) },
      );
    }

    return true;
  }

  async function addMember(values: AddMemberFormValues) {
    setErrorMessage(null);

    let result: CreateMemberResult;

    try {
      result = await createMember({
        email: values.email,
        roleIds: values.roleIds,
        ...(values.name && { name: values.name }),
        ...(values.password && { password: values.password }),
      });
    } catch (error) {
      if (isApiErrorWithCode(error, 'ALREADY_MEMBER')) {
        setError('email', { message: error.message }, { shouldFocus: true });
        return;
      }

      if (isApiErrorWithCode(error, 'ACCOUNT_DETAILS_REQUIRED') && showMissingAccountDetails(values)) {
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível adicionar agora. Tente novamente.'));
      return;
    }

    close();
    toast.success(getAddedMessage(result));
    router.refresh();
  }

  return {
    control: form.control,
    isOpen,
    isSubmitting,
    errorMessage,
    changeOpen,
    submit: handleSubmit(addMember),
  };
}
