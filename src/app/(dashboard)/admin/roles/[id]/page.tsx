import { ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest, getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { formatPermissionsCount, hasAllPermissions } from '@/lib/permissions';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

import { PermissionMatrix } from '../permission-matrix';
import RoleForm from '../role-form';
import { OUT_OF_SCOPE_DESCRIPTION, ROLE_DELETE_TEXTS } from '../roles-config';

type RolePageProps = {
  params: Promise<{ id: string }>;
};

function getRole(id: string, token: string): Promise<Role> {
  return getRecordOrNotFound<Role>(`/roles/${id}`, token);
}

export async function generateMetadata({ params }: RolePageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'roles.read')) {
    return { title: 'Cargo' };
  }

  const { id } = await params;
  const role = await getRole(id, session.accessToken);

  return { title: role.name };
}

export default async function RolePage({ params }: RolePageProps) {
  const session = await requireSession('roles.read');
  const { id } = await params;
  const [role, permissions] = await Promise.all([
    getRole(id, session.accessToken),
    apiRequest<Paginated<Permission>>('/permissions?limit=100', { token: session.accessToken }),
  ]);
  const isManageable = hasAllPermissions(role.permissionIds, permissions.data, session.permissions);
  const hasUpdatePermission = hasPermission(session, 'roles.update');
  const canUpdate = hasUpdatePermission && isManageable;
  const canDelete = hasPermission(session, 'roles.delete') && isManageable;

  return (
    <RecordPageLayout
      backHref='/admin/roles'
      backLabel='Cargos'
      icon={ShieldCheck}
      title={role.name}
      description={`${formatPermissionsCount(role.permissionIds.length)} · Cadastro criado em ${formatDate(role.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...ROLE_DELETE_TEXTS}
            recordName={role.name}
            deletePath={`/roles/${role.id}`}
            listHref='/admin/roles'
          />
        )
      }
    >
      {canUpdate ? (
        <RoleForm
          role={role}
          permissions={permissions.data}
          grantedPermissions={session.permissions}
        />
      ) : (
        <RecordDetails
          title='Dados do cargo'
          description={hasUpdatePermission ? OUT_OF_SCOPE_DESCRIPTION : undefined}
          fields={[
            { label: 'Nome', value: role.name },
            { label: 'Descrição', value: role.description, wide: true },
          ]}
        >
          <PermissionMatrix
            permissions={permissions.data}
            value={role.permissionIds}
            grantedPermissions={session.permissions}
            readOnly
          />
        </RecordDetails>
      )}
    </RecordPageLayout>
  );
}
