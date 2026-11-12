import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type StepActionsProps = {
  submitLabel: string;
  onBack?: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
};

export function StepActions({
  submitLabel,
  onBack,
  loading = false,
  loadingText,
  disabled,
}: StepActionsProps) {
  return (
    <div className={cn('mt-2 grid gap-3', onBack ? 'grid-cols-[auto_1fr]' : 'grid-cols-1')}>
      {onBack && (
        <Button
          type='button'
          variant='outline'
          size='xl'
          className='w-full'
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeftIcon className='size-4' />
          Voltar
        </Button>
      )}

      <Button
        type='submit'
        size='xl'
        className='w-full'
        loading={loading}
        loadingText={loadingText}
        disabled={disabled}
      >
        {submitLabel}
        <ChevronRightIcon className='size-4' />
      </Button>
    </div>
  );
}
