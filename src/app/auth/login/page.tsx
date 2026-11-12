import type { Metadata } from 'next';

import { getSafeCallbackUrl } from '@/lib/callback-url';

import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Entrar',
};

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;

  return (
    <LoginForm
      callbackUrl={getSafeCallbackUrl(callbackUrl)}
      initialError={typeof error === 'string' ? error : undefined}
    />
  );
}
