import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import CreateCompanyForm from './create-company-form';

export const metadata: Metadata = {
  title: 'Criar empresa',
};

export default async function CreateCompanyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <CreateCompanyForm hasCompany={Boolean(session.company)} />;
}
