import { useRef, useState } from 'react';

import { useSendSignUpCode } from '@/hooks/auth/use-send-sign-up-code';
import { useVerifySignUpEmail } from '@/hooks/auth/use-verify-sign-up-email';
import { getApiErrorMessage } from '@/lib/api';

export const CODE_LENGTH = 6;

type VerificationMessage = {
  variant: 'info' | 'success';
  text: string;
};

type UseEmailVerificationOptions = {
  email: string;
  notice: string | null;
  onCodeSent: (sentAt: number) => void;
  onVerified: (verificationToken: string) => void;
};

export function useEmailVerification({
  email,
  notice,
  onCodeSent,
  onVerified,
}: UseEmailVerificationOptions) {
  const codeInputRef = useRef<HTMLDivElement>(null);
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifySignUpEmail();
  const { mutate: sendCode, isPending: isResending } = useSendSignUpCode();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [message, setMessage] = useState<VerificationMessage | null>(
    notice ? { variant: 'info', text: notice } : null,
  );

  function focusCodeInput() {
    codeInputRef.current?.querySelector('input')?.focus();
  }

  function changeCode(value: string) {
    setCode(value);
    setCodeError(null);
  }

  async function verifyCode(value: string) {
    if (value.length !== CODE_LENGTH || isVerifying) {
      return;
    }

    setCodeError(null);
    setMessage(null);

    let verificationToken: string;

    try {
      verificationToken = await verifyEmail(email, value);
    } catch (error) {
      setCodeError(
        getApiErrorMessage(error, 'Não foi possível confirmar o código agora. Tente novamente.'),
      );
      setCode('');
      focusCodeInput();
      return;
    }

    onVerified(verificationToken);
  }

  async function resendCode() {
    setCodeError(null);
    setMessage(null);

    try {
      await sendCode(email);
    } catch (error) {
      setCodeError(
        getApiErrorMessage(error, 'Não foi possível reenviar o código agora. Tente novamente.'),
      );
      return;
    }

    onCodeSent(Date.now());
    setCode('');
    setMessage({ variant: 'success', text: 'Enviamos um novo código para o seu e-mail.' });
    focusCodeInput();
  }

  return {
    codeInputRef,
    code,
    codeError,
    message,
    isVerifying,
    isResending,
    changeCode,
    verifyCode,
    resendCode,
  };
}
