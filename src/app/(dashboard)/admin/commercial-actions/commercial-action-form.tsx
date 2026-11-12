'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormAsyncCombobox } from '@/components/form/form-async-combobox';
import { FormCard } from '@/components/form/form-card';
import { FormFileAttachments } from '@/components/form/form-file-attachments';
import { FormInput } from '@/components/form/form-input';
import { FormMoneyInput } from '@/components/form/form-money-input';
import { FormSection } from '@/components/form/form-section';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreateCommercialAction } from '@/hooks/commercial-actions/use-create-commercial-action';
import { useUpdateCommercialAction } from '@/hooks/commercial-actions/use-update-commercial-action';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import type { ComboboxOption } from '@/lib/combobox-sources';
import { formatCurrency, toDateInputValue, toMoneyInputValue } from '@/lib/format';
import {
  optionalDateSchema,
  optionalMoneySchema,
  optionalTextSchema,
  optionIdsSchema,
  requiredOptionSchema,
  storedFilesSchema,
} from '@/lib/schemas';
import type {
  CommercialAction,
  CommercialActionInput,
  CommercialActionRelation,
} from '@/types/commercial-action';

import type { ActionFormOptions } from './action-form-options';
import { COMMERCIAL_ACTIONS_HREF } from './commercial-actions-config';

const actionFormSchema = z
  .object({
    eventId: z.string().min(1, 'Selecione o evento'),
    description: optionalTextSchema,
    initialDate: optionalDateSchema,
    finalDate: optionalDateSchema,
    invoiceNumber: optionalTextSchema,
    walletId: z.string().min(1, 'Selecione a carteira'),
    price: optionalMoneySchema,
    producerGuests: optionIdsSchema,
    resellerGuests: optionIdsSchema,
    responsible: requiredOptionSchema('Selecione o responsável'),
    participants: optionIdsSchema,
    files: storedFilesSchema,
  })
  .refine(
    (values) => !values.initialDate || !values.finalDate || values.finalDate >= values.initialDate,
    { message: 'A data de fim não pode ser antes do início.', path: ['finalDate'] },
  );

type ActionFormInput = z.input<typeof actionFormSchema>;
type ActionFormOutput = z.output<typeof actionFormSchema>;

function toOption({ id, name }: CommercialActionRelation): ComboboxOption {
  return { value: id, label: name };
}

function toFormValues(action?: CommercialAction): ActionFormInput {
  return {
    eventId: action?.eventId ?? '',
    description: action?.description ?? '',
    initialDate: action?.initialDate ? toDateInputValue(action.initialDate) : '',
    finalDate: action?.finalDate ? toDateInputValue(action.finalDate) : '',
    invoiceNumber: action?.invoiceNumber ?? '',
    walletId: action?.walletId ?? '',
    price: action?.price == null ? '' : toMoneyInputValue(action.price),
    producerGuests: action?.producerGuests.map(toOption) ?? [],
    resellerGuests: action?.resellerGuests.map(toOption) ?? [],
    responsible: action ? toOption(action.responsible) : null,
    participants: action?.participants.map(toOption) ?? [],
    files: action?.files ?? [],
  };
}

function withCurrent<T extends { id: string }>(items: T[], current: T | null): T[] {
  return current && !items.some((item) => item.id === current.id) ? [...items, current] : items;
}

type CommercialActionFormProps = ActionFormOptions & {
  action?: CommercialAction;
};

export default function CommercialActionForm({
  action,
  events,
  wallets,
  canSearchProducers,
  canSearchResellers,
  canSearchEmployees,
  attachments,
}: CommercialActionFormProps) {
  const returnToList = useReturnToList(COMMERCIAL_ACTIONS_HREF);
  const { mutate: createAction } = useCreateCommercialAction();
  const { mutate: updateAction } = useUpdateCommercialAction();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(actionFormSchema),
    defaultValues: toFormValues(action),
  });
  const [walletId, initialDate, responsible] = useWatch({
    control,
    name: ['walletId', 'initialDate', 'responsible'],
  });
  const eventOptions = withCurrent(events, action ? action.event : null).map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  const walletOptions = withCurrent(
    wallets,
    action ? { id: action.walletId, name: action.wallet.name, balance: 0 } : null,
  );
  const selectedWallet = walletOptions.find((wallet) => wallet.id === walletId);
  const reservedCents =
    action && action.walletId === walletId ? Math.round((action.price ?? 0) * 100) : 0;
  const availableCents = selectedWallet
    ? Math.round(selectedWallet.balance * 100) + reservedCents
    : null;

  function removeResponsibleFromParticipants(next: ComboboxOption[]) {
    const responsibleId = next[0]?.value;

    setValue(
      'participants',
      getValues('participants').filter((participant) => participant.value !== responsibleId),
      { shouldDirty: true },
    );
  }

  async function handleSave({
    producerGuests,
    resellerGuests,
    responsible: responsibleId,
    participants,
    files,
    ...values
  }: ActionFormOutput) {
    if (isUploading) {
      setErrorMessage('Aguarde o envio dos anexos terminar para salvar.');
      return;
    }

    setErrorMessage(null);

    const input: CommercialActionInput = {
      ...values,
      responsibleId,
      participantIds: participants.filter((id) => id !== responsibleId),
      ...(canSearchProducers && { producerGuestIds: producerGuests }),
      ...(canSearchResellers && { resellerGuestIds: resellerGuests }),
      ...(attachments && { fileIds: files.map((file) => file.id) }),
    };

    try {
      if (action) {
        await updateAction(action.id, input);
      } else {
        await createAction(input);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'INSUFFICIENT_BALANCE')) {
        setError('price', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(action ? 'Alterações salvas.' : 'Ação comercial cadastrada.');
  }

  return (
    <FormCard
      title='Dados da ação'
      description='Evento, valor, convidados, equipe e documentos da ação comercial.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(action)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={COMMERCIAL_ACTIONS_HREF}
      createLabel='Cadastrar ação'
    >
      <div className='flex flex-col gap-6'>
        <FormSection title='Dados gerais' description='Evento, descrição, período e nota fiscal.'>
          <FormSelect
            control={control}
            name='eventId'
            label='Evento'
            required
            options={eventOptions}
            placeholder='Selecione o evento'
            disabled={eventOptions.length === 0}
            description={eventOptions.length === 0 && 'Cadastre um evento antes da ação.'}
          />
          <FormInput
            control={control}
            name='invoiceNumber'
            label='Nº da nota'
            autoComplete='off'
            placeholder='Ex.: NF 12345'
          />
          <FormTextarea
            control={control}
            name='description'
            label='Descrição'
            placeholder='O que é a ação (ex.: Dia de campo da soja)'
            className='sm:col-span-2'
          />
          <FormInput control={control} name='initialDate' label='Início' type='date' />
          <FormInput
            control={control}
            name='finalDate'
            label='Fim'
            type='date'
            min={initialDate || undefined}
          />
        </FormSection>

        <FormSection
          title='Financeiro'
          description='O valor sai da carteira ao salvar. Mudar o valor ou a carteira devolve o valor antigo e debita o novo; excluir a ação devolve o valor.'
        >
          <FormSelect
            control={control}
            name='walletId'
            label='Carteira'
            required
            options={walletOptions.map((wallet) => ({
              value: wallet.id,
              label: `${wallet.name} (${formatCurrency(wallet.balance)})`,
            }))}
            placeholder='Selecione a carteira'
            disabled={walletOptions.length === 0}
            description={walletOptions.length === 0 && 'Crie uma carteira antes da ação.'}
          />
          <FormMoneyInput
            control={control}
            name='price'
            label='Valor'
            description={
              availableCents === null
                ? 'Escolha a carteira para ver o saldo disponível.'
                : `Saldo disponível para esta ação: ${formatCurrency(availableCents / 100)}.`
            }
          />
        </FormSection>

        {(canSearchProducers || canSearchResellers) && (
          <FormSection title='Convidados' description='Produtores e revendas convidados para a ação.'>
            {canSearchProducers && (
              <FormAsyncCombobox
                control={control}
                name='producerGuests'
                label='Produtores'
                multiple
                source='producers'
                placeholder='Selecione os produtores'
                searchPlaceholder='Buscar por nome ou CPF/CNPJ'
              />
            )}
            {canSearchResellers && (
              <FormAsyncCombobox
                control={control}
                name='resellerGuests'
                label='Revendas'
                multiple
                source='resellers'
                placeholder='Selecione as revendas'
                searchPlaceholder='Buscar por nome ou CNPJ'
              />
            )}
          </FormSection>
        )}

        <FormSection title='Equipe' description='Quem responde pela ação e quem participa dela.'>
          <FormAsyncCombobox
            control={control}
            name='responsible'
            label='Responsável'
            required
            source='activeEmployees'
            placeholder='Selecione o responsável'
            searchPlaceholder='Buscar funcionário ativo'
            disabled={!canSearchEmployees}
            onValueChange={removeResponsibleFromParticipants}
            description={
              !canSearchEmployees && 'Só quem tem acesso aos funcionários pode trocar a equipe.'
            }
          />
          <FormAsyncCombobox
            control={control}
            name='participants'
            label='Participantes'
            multiple
            source='activeEmployees'
            placeholder='Selecione os participantes'
            searchPlaceholder='Buscar funcionário ativo'
            excludeValues={responsible ? [responsible.value] : []}
            disabled={!canSearchEmployees}
          />
        </FormSection>

        {attachments && (
          <FormSection
            title='Anexos'
            description='Nota fiscal, fotos e outros documentos da ação.'
            columns={1}
          >
            <FormFileAttachments
              control={control}
              name='files'
              label='Anexos'
              hideLabel
              permissions={attachments}
              onUploadingChange={setIsUploading}
            />
          </FormSection>
        )}
      </div>
    </FormCard>
  );
}
