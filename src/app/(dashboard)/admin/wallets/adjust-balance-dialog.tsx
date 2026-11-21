'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { FormMoneyInput } from '@/components/form/form-money-input';
import { FormRadioCards } from '@/components/form/form-radio-cards';
import { FormTextarea } from '@/components/form/form-textarea';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useAdjustWallet } from '@/hooks/wallets/use-adjust-wallet';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { formatCurrency, parseMoney } from '@/lib/format';

import { formatSignedCurrency } from './wallets-config';

const ADJUST_FORM_ID = 'adjust-balance-form';
const REASON_MAX_LENGTH = 500;

const DIRECTION_OPTIONS = [
  {
    value: 'credit',
    label: 'Acrescentar',
    description: 'Soma o valor ao saldo.',
    icon: ArrowDownLeft,
  },
  {
    value: 'debit',
    label: 'Diminuir',
    description: 'Tira o valor do saldo.',
    icon: ArrowUpRight,
  },
];

const adjustFormSchema = z.object({
  direction: z.enum(['credit', 'debit']),
  amount: z
    .string()
    .refine((value) => (parseMoney(value) ?? 0) > 0, 'Informe um valor maior que zero')
    .transform((value) => parseMoney(value) ?? 0),
  reason: z
    .string()
    .trim()
    .min(1, 'Informe o motivo do ajuste')
    .max(REASON_MAX_LENGTH, `O motivo pode ter até ${REASON_MAX_LENGTH} caracteres`),
});

type AdjustFormInput = z.input<typeof adjustFormSchema>;
type AdjustFormOutput = z.output<typeof adjustFormSchema>;

const DEFAULT_VALUES: AdjustFormInput = { direction: 'credit', amount: '', reason: '' };

function getAmountDescription(balanceCents: number, amountCents: number, isDebit: boolean): string {
  if (amountCents <= 0) {
    return `Saldo atual: ${formatCurrency(balanceCents / 100)}.`;
  }

  const resultCents = isDebit ? balanceCents - amountCents : balanceCents + amountCents;

  return resultCents < 0
    ? `O desconto passa do saldo atual (${formatCurrency(balanceCents / 100)}).`
    : `Saldo depois do ajuste: ${formatCurrency(resultCents / 100)}.`;
}

type AdjustBalanceDialogProps = {
  walletId: string;
  balance: number;
};

export function AdjustBalanceDialog({ walletId, balance }: AdjustBalanceDialogProps) {
  const router = useRouter();
  const { mutate: adjustWallet } = useAdjustWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(adjustFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const [direction, amount] = useWatch({ control, name: ['direction', 'amount'] });
  const balanceCents = Math.round(balance * 100);
  const amountCents = Math.round((parseMoney(amount) ?? 0) * 100);

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

  async function handleAdjust({ direction: selected, amount: value, reason }: AdjustFormOutput) {
    setErrorMessage(null);

    if (selected === 'debit' && Math.round(value * 100) > balanceCents) {
      setError(
        'amount',
        { message: `O desconto não pode passar do saldo atual (${formatCurrency(balance)}).` },
        { shouldFocus: true },
      );
      return;
    }

    try {
      await adjustWallet(walletId, { direction: selected, amount: value, reason });
    } catch (error) {
      if (isApiErrorWithCode(error, 'INSUFFICIENT_BALANCE')) {
        setError('amount', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(
        getApiErrorMessage(error, 'Não foi possível ajustar o saldo agora. Tente novamente.'),
      );
      return;
    }

    handleOpenChange(false);
    toast.success(`Saldo ajustado: ${formatSignedCurrency(selected === 'debit' ? -value : value)}.`);
    router.refresh();
  }

  return (
    <Modal
      title='Ajustar saldo'
      description='O ajuste entra no extrato da carteira com o motivo, a data e o seu nome.'
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button>
          <SlidersHorizontal />
          Ajustar saldo
        </Button>
      }
      actions={
        <Button type='submit' form={ADJUST_FORM_ID} loading={isSubmitting} loadingText='Ajustando...'>
          Ajustar saldo
        </Button>
      }
    >
      <form
        id={ADJUST_FORM_ID}
        noValidate
        onSubmit={handleSubmit(handleAdjust)}
        className='flex flex-col gap-5'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}
        <FormRadioCards
          control={control}
          name='direction'
          label='Operação'
          options={DIRECTION_OPTIONS}
          required
        />
        <FormMoneyInput
          control={control}
          name='amount'
          label='Valor'
          required
          description={getAmountDescription(balanceCents, amountCents, direction === 'debit')}
        />
        <FormTextarea
          control={control}
          name='reason'
          label='Motivo'
          required
          maxLength={REASON_MAX_LENGTH}
          placeholder='Ex.: reposição mensal da verba de eventos'
          description='Fica registrado no extrato, junto com o valor.'
        />
      </form>
    </Modal>
  );
}
