import { AuthHeader } from '@/components/auth/auth-header';
import { CheckCircleIcon } from '@/components/ui/icons';

import { StepActions } from './step-actions';

type EmailVerifiedStepProps = {
  email: string;
  onBack: () => void;
  onContinue: () => void;
};

export function EmailVerifiedStep({ email, onBack, onContinue }: EmailVerifiedStepProps) {
  return (
    <>
      <AuthHeader
        icon={<CheckCircleIcon className='size-7' />}
        title='E-mail confirmado'
        description={
          <>
            O e-mail <strong className='font-semibold text-slate-700'>{email}</strong> já foi
            confirmado. Agora falta só a sua empresa.
          </>
        }
      />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
        className='flex flex-col animate-fade-up [animation-delay:80ms]'
      >
        <StepActions submitLabel='Continuar' onBack={onBack} />
      </form>
    </>
  );
}
