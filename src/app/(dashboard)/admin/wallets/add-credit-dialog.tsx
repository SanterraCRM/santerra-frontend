'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormMoneyInput } from '@/components/form/form-money-input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useCreditWallet } from '@/hooks/wallets/use-credit-wallet';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, parseMoney } from '@/lib/format';

const CREDIT_FORM_ID = 'add-credit-form';

const creditFormSchema = z.object({
  amount: z
    .string()
    .refine((value) => (parseMoney(value) ?? 0) > 0, 'Informe um valor maior que zero')
    .transform((value) => parseMoney(value) ?? 0),
});

type CreditFormOutput = z.output<typeof creditFormSchema>;

type AddCreditDialogProps = {
  walletId: string;
};

export function AddCreditDialog({ walletId }: AddCreditDialogProps) {
  const router = useRouter();
  const { mutate: creditWallet } = useCreditWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(creditFormSchema),
    defaultValues: { amount: '' },
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

  async function handleCredit({ amount }: CreditFormOutput) {
    setErrorMessage(null);

    try {
      await creditWallet(walletId, amount);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Não foi possível adicionar o crédito agora. Tente novamente.'),
      );
      return;
    }

    handleOpenChange(false);
    toast.success(`Crédito de ${formatCurrency(amount)} adicionado.`);
    router.refresh();
  }

  return (
    <Modal
      title='Adicionar crédito'
      description='O valor é somado ao saldo atual da carteira.'
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button>
          <Plus />
          Adicionar crédito
        </Button>
      }
      actions={
        <Button type='submit' form={CREDIT_FORM_ID} loading={isSubmitting} loadingText='Adicionando...'>
          Adicionar crédito
        </Button>
      }
    >
      <form
        id={CREDIT_FORM_ID}
        noValidate
        onSubmit={handleSubmit(handleCredit)}
        className='flex flex-col gap-5'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}
        <FormMoneyInput control={control} name='amount' label='Valor do crédito' required />
      </form>
    </Modal>
  );
}
