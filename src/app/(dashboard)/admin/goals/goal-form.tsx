'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormAsyncCombobox } from '@/components/form/form-async-combobox';
import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormMoneyInput } from '@/components/form/form-money-input';
import { FormRadioCards } from '@/components/form/form-radio-cards';
import { FormSection } from '@/components/form/form-section';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreateGoal } from '@/hooks/goals/use-create-goal';
import { useUpdateGoal } from '@/hooks/goals/use-update-goal';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage } from '@/lib/api';
import { maskInteger, parseMoney, toDateInputValue, toMoneyInputValue } from '@/lib/format';
import { optionalTextSchema, requiredDateSchema, requiredOptionSchema } from '@/lib/schemas';
import type { Goal, GoalInput, GoalMetric } from '@/types/goal';

import { GOAL_METRICS, GOALS_HREF, isSalesMetric } from './goals-config';

const METRIC_OPTIONS = Object.entries(GOAL_METRICS).map(([value, { label, description, icon }]) => ({
  value,
  label,
  description,
  icon,
}));

type TargetFields = {
  metric?: GoalMetric;
  targetCount: string;
  targetMoney: string;
};

function getTargetValue({ metric, targetCount, targetMoney }: TargetFields): number | null {
  if (!metric) {
    return null;
  }

  if (isSalesMetric(metric)) {
    return parseMoney(targetMoney);
  }

  return targetCount ? Number(targetCount) : null;
}

const goalFormSchema = z
  .object({
    metric: z.enum(['COMPLETED_TRIPS', 'VISITED_PRODUCERS', 'COMMERCIAL_ACTIONS', 'SALES']).optional(),
    employee: requiredOptionSchema('Selecione o vendedor'),
    startDate: requiredDateSchema('Informe a data inicial'),
    endDate: requiredDateSchema('Informe a data final'),
    targetCount: z.string(),
    targetMoney: z.string(),
    achievedValue: z.string(),
    description: optionalTextSchema,
  })
  .superRefine((values, context) => {
    if (!values.metric) {
      context.addIssue({ code: 'custom', path: ['metric'], message: 'Selecione o indicador' });
      return;
    }

    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'A data final não pode ser antes da inicial',
      });
    }

    if (!getTargetValue(values)) {
      context.addIssue({
        code: 'custom',
        path: [isSalesMetric(values.metric) ? 'targetMoney' : 'targetCount'],
        message: 'Informe uma meta maior que zero',
      });
    }
  });

type GoalFormInput = z.input<typeof goalFormSchema>;
type GoalFormOutput = z.output<typeof goalFormSchema>;

function describeValues(metric: GoalMetric | undefined): string {
  if (!metric) {
    return 'Escolha o indicador para informar a meta.';
  }

  return isSalesMetric(metric)
    ? 'Sem o ERP, o valor vendido é atualizado à mão.'
    : 'O realizado é calculado sozinho, a partir das visitas e ações registradas.';
}

function toFormValues(goal?: Goal): GoalFormInput {
  const isSales = goal ? isSalesMetric(goal.metric) : false;

  return {
    metric: goal?.metric,
    employee: goal ? { value: goal.employee.id, label: goal.employee.name } : null,
    startDate: goal ? toDateInputValue(goal.startDate) : '',
    endDate: goal ? toDateInputValue(goal.endDate) : '',
    targetCount: goal && !isSales ? String(goal.targetValue) : '',
    targetMoney: goal && isSales ? toMoneyInputValue(goal.targetValue) : '',
    achievedValue: goal?.achievedValue != null ? toMoneyInputValue(goal.achievedValue) : '',
    description: goal?.description ?? '',
  };
}

type GoalFormProps = {
  goal?: Goal;
  canSearchEmployees: boolean;
};

export default function GoalForm({ goal, canSearchEmployees }: GoalFormProps) {
  const returnToList = useReturnToList(GOALS_HREF);
  const { mutate: createGoal } = useCreateGoal();
  const { mutate: updateGoal } = useUpdateGoal();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(goalFormSchema),
    defaultValues: toFormValues(goal),
  });
  const metric = useWatch({ control, name: 'metric' });
  const isSales = metric ? isSalesMetric(metric) : false;

  async function handleSave(values: GoalFormOutput) {
    if (!values.metric) {
      return;
    }

    setErrorMessage(null);

    const input: GoalInput = {
      metric: values.metric,
      employeeId: values.employee,
      startDate: values.startDate,
      endDate: values.endDate,
      targetValue: getTargetValue(values) ?? 0,
      achievedValue: isSalesMetric(values.metric) ? parseMoney(values.achievedValue) : null,
      description: values.description,
    };

    try {
      if (goal) {
        await updateGoal(goal.id, input);
      } else {
        await createGoal(input);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(goal ? 'Alterações salvas.' : 'Meta cadastrada.');
  }

  return (
    <FormCard
      title='Dados da meta'
      description='O que medir, de quem, em qual período e quanto alcançar.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(goal)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={GOALS_HREF}
      createLabel='Cadastrar meta'
    >
      <div className='flex flex-col gap-6'>
        <FormRadioCards
          control={control}
          name='metric'
          label='Indicador'
          required
          options={METRIC_OPTIONS}
        />

        <FormSection
          title='Vendedor e período'
          description='A meta conta só o que acontece entre as duas datas, inclusive nelas.'
        >
          <FormAsyncCombobox
            control={control}
            name='employee'
            label='Vendedor'
            required
            source='activeEmployees'
            placeholder='Selecione o vendedor'
            searchPlaceholder='Buscar funcionário ativo'
            disabled={!canSearchEmployees}
            description={
              !canSearchEmployees && 'Só quem tem acesso aos funcionários pode trocar o vendedor.'
            }
            className='sm:col-span-2'
          />
          <FormInput control={control} name='startDate' label='Início' type='date' required />
          <FormInput control={control} name='endDate' label='Fim' type='date' required />
          <FormTextarea
            control={control}
            name='description'
            label='Descrição'
            placeholder='Ex.: Safra 2026/27, linha de sementes'
            className='sm:col-span-2'
          />
        </FormSection>

        <FormSection title='Valores' description={describeValues(metric)}>
          {isSales ? (
            <>
              <FormMoneyInput control={control} name='targetMoney' label='Meta de vendas' required />
              <FormMoneyInput
                control={control}
                name='achievedValue'
                label='Vendido no período'
                description='Atualize sempre que tiver o valor novo.'
              />
            </>
          ) : (
            <FormInput
              control={control}
              name='targetCount'
              label={metric ? GOAL_METRICS[metric].targetLabel : 'Meta'}
              required
              mask={maskInteger}
              inputMode='numeric'
              disabled={!metric}
            />
          )}
        </FormSection>
      </div>
    </FormCard>
  );
}
