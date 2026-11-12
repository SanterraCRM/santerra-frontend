'use client';

import type { FormEvent } from 'react';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { CodeInput } from '@/components/ui/code-input';
import { MailIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';

import { StepActions } from './step-actions';
import { CODE_LENGTH, useEmailVerification } from './use-email-verification';
import { useResendCooldown } from './use-resend-cooldown';

const CODE_ERROR_ID = 'verification-code-error';

const linkButtonClassName =
  'rounded font-semibold text-brand-600 transition hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-60';

type VerificationStepProps = {
  email: string;
  codeSentAt: number | null;
  notice: string | null;
  onCodeSent: (sentAt: number) => void;
  onVerified: (verificationToken: string) => void;
  onChangeEmail: () => void;
  onBack: () => void;
};

export function VerificationStep({
  email,
  codeSentAt,
  notice,
  onCodeSent,
  onVerified,
  onChangeEmail,
  onBack,
}: VerificationStepProps) {
  const {
    codeInputRef,
    code,
    codeError,
    message,
    isVerifying,
    isResending,
    changeCode,
    verifyCode,
    resendCode,
  } = useEmailVerification({ email, notice, onCodeSent, onVerified });
  const secondsUntilResend = useResendCooldown(codeSentAt);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verifyCode(code);
  }

  return (
    <>
      <AuthHeader
        icon={<MailIcon className='size-7' />}
        title='Confirme seu e-mail'
        description={
          <>
            Enviamos um código de {CODE_LENGTH} dígitos para{' '}
            <strong className='font-semibold text-slate-700'>{email}</strong>. Digite-o abaixo para
            continuar.
          </>
        }
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {message && <Alert variant={message.variant}>{message.text}</Alert>}

        <div className='flex flex-col gap-2'>
          <span className='text-sm font-semibold text-slate-700'>Código de verificação</span>

          <CodeInput
            ref={codeInputRef}
            label='Código de verificação'
            length={CODE_LENGTH}
            value={code}
            onChange={changeCode}
            onComplete={(value) => void verifyCode(value)}
            invalid={Boolean(codeError)}
            readOnly={isVerifying}
            autoFocus
            describedBy={codeError ? CODE_ERROR_ID : undefined}
          />

          {codeError && (
            <p id={CODE_ERROR_ID} role='alert' className='text-[13px] font-medium text-red-600'>
              {codeError}
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-slate-500'>
          <span className='flex items-center gap-1.5'>
            Não recebeu?
            {isResending ? (
              <span className='flex items-center gap-1.5 font-semibold text-brand-600'>
                <Spinner />
                Reenviando...
              </span>
            ) : secondsUntilResend > 0 ? (
              <span className='font-medium tabular-nums text-slate-400'>
                Reenviar em {secondsUntilResend}s
              </span>
            ) : (
              <button
                type='button'
                onClick={() => void resendCode()}
                disabled={isVerifying}
                className={linkButtonClassName}
              >
                Reenviar código
              </button>
            )}
          </span>

          <button
            type='button'
            onClick={onChangeEmail}
            disabled={isVerifying}
            className={linkButtonClassName}
          >
            Alterar e-mail
          </button>
        </div>

        <StepActions
          submitLabel='Confirmar e-mail'
          onBack={onBack}
          loading={isVerifying}
          loadingText='Confirmando...'
          disabled={code.length !== CODE_LENGTH}
        />

        <p className='text-center text-[13px] text-slate-400'>
          O código expira em 15 minutos. Confira também a caixa de spam.
        </p>
      </form>
    </>
  );
}
