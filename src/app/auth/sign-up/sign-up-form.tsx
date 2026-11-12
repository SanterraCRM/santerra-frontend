'use client';

import { AuthHeader } from '@/components/auth/auth-header';
import { AuthSwitchLink } from '@/components/auth/auth-switch-link';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from '@/components/ui/icons';

import { AccountStep } from './account-step';
import { CompanyStep } from './company-step';
import { EmailVerifiedStep } from './email-verified-step';
import { PasswordStep } from './password-step';
import { SignUpStepper } from './sign-up-stepper';
import { useSignUpFlow } from './use-sign-up-flow';
import { VerificationStep } from './verification-step';

export default function SignUpForm() {
  const flow = useSignUpFlow();

  if (flow.createdCompanyName) {
    return (
      <>
        <AuthHeader
          icon={<CheckCircleIcon className='size-7' />}
          title='Conta criada!'
          description={`Sua conta e a empresa ${flow.createdCompanyName} foram criadas, mas não conseguimos entrar automaticamente. Entre com seu e-mail e senha para continuar.`}
        />

        <Button href='/auth/login' size='xl' className='w-full animate-fade-up'>
          Ir para o login
        </Button>
      </>
    );
  }

  return (
    <>
      <SignUpStepper currentStep={flow.step} />

      <div key={flow.step}>
        {flow.step === 'account' && (
          <AccountStep
            defaultValues={flow.account}
            emailError={flow.emailError}
            onSubmit={flow.submitAccount}
          />
        )}

        {flow.step === 'password' && (
          <PasswordStep
            email={flow.account.email}
            defaultValues={flow.passwords}
            error={flow.stepError}
            onBack={flow.backToAccount}
            onSubmit={flow.submitPassword}
          />
        )}

        {flow.step === 'verification' &&
          (flow.isEmailVerified ? (
            <EmailVerifiedStep
              email={flow.account.email}
              onBack={() => flow.goTo('password')}
              onContinue={() => flow.goTo('company')}
            />
          ) : (
            <VerificationStep
              email={flow.account.email}
              codeSentAt={flow.codeSentAt}
              notice={flow.verificationNotice}
              onCodeSent={flow.markCodeSent}
              onVerified={flow.markEmailVerified}
              onChangeEmail={() => flow.goTo('account')}
              onBack={() => flow.goTo('password')}
            />
          ))}

        {flow.step === 'company' && (
          <CompanyStep
            name={flow.account.name}
            email={flow.account.email}
            defaultValues={flow.company}
            error={flow.stepError}
            isRedirecting={flow.isRedirecting}
            onBack={flow.backToVerification}
            onSubmit={flow.submitCompany}
          />
        )}
      </div>

      {flow.step === 'account' && (
        <AuthSwitchLink question='Já tem uma conta?' href='/auth/login' label='Entrar' />
      )}
    </>
  );
}
