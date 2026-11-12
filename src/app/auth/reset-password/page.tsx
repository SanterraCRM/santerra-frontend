import type { Metadata } from 'next';

import { AuthHeader } from '@/components/auth/auth-header';
import { BackToLoginLink } from '@/components/auth/back-to-login-link';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon } from '@/components/ui/icons';

import ResetPasswordForm from './reset-password-form';

export const metadata: Metadata = {
  title: 'Criar nova senha',
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (typeof token !== 'string' || token.length === 0) {
    return (
      <>
        <AuthHeader
          icon={<AlertCircleIcon className='size-7' />}
          title='Link inválido'
          description='Este link de recuperação está incompleto. Peça um novo link para criar a sua senha.'
        />

        <Button href='/auth/forgot-password' size='xl' className='w-full'>
          Solicitar novo link
        </Button>

        <BackToLoginLink />
      </>
    );
  }

  return <ResetPasswordForm token={token} />;
}
