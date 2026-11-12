import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { getSafeCallbackUrl } from '@/lib/callback-url';

import CompanyPicker from './company-picker';

export const metadata: Metadata = {
  title: 'Escolher empresa',
};

type SelectCompanyPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SelectCompanyPage({ searchParams }: SelectCompanyPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const { callbackUrl } = await searchParams;

  return (
    <CompanyPicker
      userName={session.user.name}
      companies={session.companies}
      currentCompanyId={session.company?.id ?? null}
      isPlatformAdmin={session.isPlatformAdmin}
      callbackUrl={getSafeCallbackUrl(callbackUrl)}
    />
  );
}
