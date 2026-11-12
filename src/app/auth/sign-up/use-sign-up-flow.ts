import { useState } from 'react';

import { useLogin } from '@/hooks/auth/use-login';
import { useSendSignUpCode } from '@/hooks/auth/use-send-sign-up-code';
import { useSignUp } from '@/hooks/auth/use-sign-up';
import { ApiError, getApiErrorMessage, isApiErrorWithStatus } from '@/lib/api';
import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';

import type { AccountValues } from './account-step';
import type { CompanyValues } from './company-step';
import type { PasswordValues } from './password-step';
import type { SignUpStep } from './sign-up-stepper';

const EMAIL_NOT_VERIFIED_CODE = 'EMAIL_NOT_VERIFIED';

type SentCode = {
  email: string;
  sentAt: number;
};

type EmailVerification = {
  email: string;
  token: string;
};

export function useSignUpFlow() {
  const { mutate: sendCode } = useSendSignUpCode();
  const { mutate: signUp } = useSignUp();
  const { mutate: login } = useLogin();
  const [step, setStep] = useState<SignUpStep>('account');
  const [account, setAccount] = useState<AccountValues>({ name: '', email: '' });
  const [passwords, setPasswords] = useState<PasswordValues>({
    password: '',
    passwordConfirmation: '',
  });
  const [company, setCompany] = useState<CompanyValues>({ companyName: '' });
  const [sentCode, setSentCode] = useState<SentCode | null>(null);
  const [verification, setVerification] = useState<EmailVerification | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [createdCompanyName, setCreatedCompanyName] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isEmailVerified = verification?.email === account.email;
  const codeSentAt = sentCode?.email === account.email ? sentCode.sentAt : null;

  function goTo(nextStep: SignUpStep) {
    setStepError(null);
    setStep(nextStep);
  }

  function returnToAccountWithEmailError(message: string) {
    setEmailError(message);
    setSentCode(null);
    setVerification(null);
    goTo('account');
  }

  function markCodeSent(sentAt: number) {
    setSentCode({ email: account.email, sentAt });
  }

  function submitAccount(values: AccountValues) {
    setAccount(values);
    setEmailError(null);
    goTo('password');
  }

  function backToAccount(values: PasswordValues) {
    setPasswords(values);
    goTo('account');
  }

  async function submitPassword(values: PasswordValues) {
    setPasswords(values);

    if (isEmailVerified) {
      goTo('company');
      return;
    }

    if (codeSentAt !== null) {
      goTo('verification');
      return;
    }

    try {
      await sendCode(account.email);
    } catch (error) {
      if (isApiErrorWithStatus(error, 409)) {
        returnToAccountWithEmailError(error.message);
        return;
      }

      if (!isApiErrorWithStatus(error, 429)) {
        setStepError(
          getApiErrorMessage(error, 'Não foi possível enviar o código agora. Tente novamente.'),
        );
        return;
      }
    }

    markCodeSent(Date.now());
    setVerificationNotice(null);
    goTo('verification');
  }

  function markEmailVerified(token: string) {
    setVerification({ email: account.email, token });
    setVerificationNotice(null);
    goTo('company');
  }

  function backToVerification(values: CompanyValues) {
    setCompany(values);
    goTo('verification');
  }

  async function submitCompany(values: CompanyValues) {
    setCompany(values);
    setStepError(null);

    try {
      await signUp({
        ...account,
        password: passwords.password,
        companyName: values.companyName,
        verificationToken: verification?.token ?? '',
      });
    } catch (error) {
      if (isApiErrorWithStatus(error, 409)) {
        returnToAccountWithEmailError(error.message);
        return;
      }

      if (error instanceof ApiError && error.code === EMAIL_NOT_VERIFIED_CODE) {
        setVerification(null);
        setVerificationNotice(error.message);
        goTo('verification');
        return;
      }

      setStepError(
        getApiErrorMessage(
          error,
          'Não foi possível criar sua conta agora. Tente novamente em instantes.',
        ),
      );
      return;
    }

    try {
      await login({ email: account.email, password: passwords.password });
    } catch {
      setCreatedCompanyName(values.companyName);
      return;
    }

    setIsRedirecting(true);
    window.location.assign(DEFAULT_CALLBACK_URL);
  }

  return {
    step,
    account,
    passwords,
    company,
    codeSentAt,
    isEmailVerified,
    emailError,
    stepError,
    verificationNotice,
    createdCompanyName,
    isRedirecting,
    goTo,
    submitAccount,
    backToAccount,
    submitPassword,
    markCodeSent,
    markEmailVerified,
    backToVerification,
    submitCompany,
  };
}
