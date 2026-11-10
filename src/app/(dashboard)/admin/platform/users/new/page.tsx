import { UserCog } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';

import UserForm from '../user-form';
import { PLATFORM_USERS_HREF } from '../users-config';

export const metadata: Metadata = {
  title: 'Novo usuário',
};

export default function NewPlatformUserPage() {
  return (
    <RecordPageLayout
      backHref={PLATFORM_USERS_HREF}
      backLabel='Usuários'
      icon={UserCog}
      title='Novo usuário'
      description='A conta entra sem empresa: para dar acesso, crie uma empresa com ela como dona ou convide pela equipe.'
    >
      <UserForm />
    </RecordPageLayout>
  );
}
