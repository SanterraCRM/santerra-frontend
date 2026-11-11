import { CircleUserRound } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { AccountSession } from '@/types/account';

import PasswordForm from './password-form';
import ProfileForm from './profile-form';

export const metadata: Metadata = {
  title: 'Minha conta',
};

export default async function AccountPage() {
  const session = await requireSession();
  const { user } = await apiRequest<AccountSession>('/auth/me', {
    token: session.accessToken,
  });

  return (
    <RecordPageLayout
      icon={CircleUserRound}
      title='Minha conta'
      description={`Seu nome e sua senha valem em todas as empresas que você acessa. Conta criada em ${formatDate(user.createdAt, 'long')}.`}
    >
      <ProfileForm account={user} />
      <PasswordForm email={user.email} />
    </RecordPageLayout>
  );
}
