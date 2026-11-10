import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest } from '@/lib/api';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Permission } from '@/types/permission';

import RoleForm from '../role-form';

export const metadata: Metadata = {
  title: 'Novo cargo',
};

export default async function NewRolePage() {
  const session = await requireSession('roles.create');
  const permissions = await apiRequest<Paginated<Permission>>('/permissions?limit=100', {
    token: session.accessToken,
  });

  return (
    <RecordPageLayout
      backHref='/admin/roles'
      backLabel='Cargos'
      icon={ShieldCheck}
      title='Novo cargo'
      description='Dê um nome ao cargo e marque o que quem o recebe pode fazer.'
    >
      <RoleForm permissions={permissions.data} grantedPermissions={session.permissions} />
    </RecordPageLayout>
  );
}
