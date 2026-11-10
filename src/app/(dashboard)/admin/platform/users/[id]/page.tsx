import { UserCog } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { requireSession } from '@/lib/session';
import type { PlatformUser } from '@/types/platform';

import UserForm from '../user-form';
import { PLATFORM_USERS_HREF } from '../users-config';

type PlatformUserPageProps = {
  params: Promise<{ id: string }>;
};

function getUser(id: string, token: string): Promise<PlatformUser> {
  return getRecordOrNotFound<PlatformUser>(`/users/${id}`, token);
}

export async function generateMetadata({ params }: PlatformUserPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session?.isPlatformAdmin) {
    return { title: 'Usuário' };
  }

  const { id } = await params;
  const user = await getUser(id, session.accessToken);

  return { title: user.name };
}

export default async function PlatformUserPage({ params }: PlatformUserPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const user = await getUser(id, session.accessToken);
  const lastLogin = user.lastLoginAt
    ? `Último acesso em ${formatDate(user.lastLoginAt, 'long')}`
    : 'Nunca entrou';

  return (
    <RecordPageLayout
      backHref={PLATFORM_USERS_HREF}
      backLabel='Usuários'
      icon={UserCog}
      title={user.name}
      description={`${user.email} · ${lastLogin}`}
    >
      <UserForm user={user} isSelf={user.email === session.user.email} />
    </RecordPageLayout>
  );
}
