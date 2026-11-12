import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export const SIGN_UP_STEPS = [
  { id: 'account', label: 'Seus dados' },
  { id: 'password', label: 'Senha' },
  { id: 'verification', label: 'Verificação' },
  { id: 'company', label: 'Empresa' },
] as const;

export type SignUpStep = (typeof SIGN_UP_STEPS)[number]['id'];

type SignUpStepperProps = {
  currentStep: SignUpStep;
};

export function SignUpStepper({ currentStep }: SignUpStepperProps) {
  const currentIndex = SIGN_UP_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label='Etapas do cadastro' className='mb-8 animate-fade-up'>
      <ol className='flex items-start'>
        {SIGN_UP_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? 'step' : undefined}
              className='relative flex flex-1 flex-col items-center gap-2'
            >
              {index > 0 && (
                <span
                  aria-hidden='true'
                  className='absolute right-[calc(50%_+_1.375rem)] top-4 h-0.5 w-[calc(100%_-_2.75rem)] -translate-y-1/2 overflow-hidden rounded-full bg-slate-200'
                >
                  <span
                    className={cn(
                      'block h-full origin-left bg-brand-500 transition-transform duration-500 ease-out',
                      index <= currentIndex ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </span>
              )}

              <span
                className={cn(
                  'relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                  isDone && 'bg-brand-600 text-white shadow-md shadow-brand-600/25',
                  isCurrent &&
                    'bg-white text-brand-600 shadow-md shadow-brand-600/15 ring-2 ring-brand-600',
                  !isDone && !isCurrent && 'bg-white text-slate-400 ring-1 ring-slate-200',
                )}
              >
                {isDone ? <CheckIcon className='size-5' strokeWidth={2.4} /> : index + 1}
              </span>

              <span
                className={cn(
                  'text-center text-xs font-semibold transition-colors',
                  isCurrent ? 'text-brand-700' : isDone ? 'text-slate-700' : 'text-slate-400',
                )}
              >
                {step.label}
                <span className='sr-only'>
                  {isDone ? ' (concluída)' : isCurrent ? ' (etapa atual)' : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
