import { Plus, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasAllPermissions } from '@/lib/permissions';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Permission } from '@/types/permission';
import type { RoleListItem } from '@/types/role';

import { ROLE_DELETE_TEXTS, ROLE_EMPTY_TEXTS, ROLE_FILTERS } from './roles-config';

export const metadata: Metadata = {
  title: 'Cargos',
};

type RolesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const session = await requireSession('roles.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, ROLE_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, ROLE_FILTERS),
  );

  const [roles, permissions] = await Promise.all([
    apiRequest<Paginated<RoleListItem>>(`/roles?${query}`, { token: session.accessToken }),
    apiRequest<Paginated<Permission>>('/permissions?limit=100', { token: session.accessToken }),
  ]);

  if (roles.meta.totalPages > 0 && page > roles.meta.totalPages) {
    redirect(buildListHref('/admin/roles', listQuery, roles.meta.totalPages, pageSize));
  }

  const canUpdate = hasPermission(session, 'roles.update');
  const canDelete = hasPermission(session, 'roles.delete');
  const isManageable = (role: RoleListItem) =>
    hasAllPermissions(role.permissionIds, permissions.data, session.permissions);
  const createAction = hasPermission(session, 'roles.create') && (
    <Button href='/admin/roles/new'>
      <Plus />
      Novo cargo
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={ShieldCheck}
        title='Cargos'
        description='Defina o que cada pessoa da equipe pode ver e fazer no sistema.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou descrição'
        filters={<ListFilters filters={ROLE_FILTERS} values={filters} />}
      />

      <DataTable
        rows={roles.data}
        rowHref={(role) => `/admin/roles/${role.id}`}
        primary={{
          header: 'Cargo',
          title: (role) => role.name,
          subtitle: (role) => role.description ?? 'Sem descrição',
        }}
        columns={[
          {
            header: 'Permissões',
            visibleFrom: 'sm',
            cell: (role) => role.permissionIds.length,
          },
          {
            header: 'Membros',
            visibleFrom: 'sm',
            cell: (role) => role.membersCount,
          },
          {
            header: 'Cadastro',
            visibleFrom: 'lg',
            cell: (role) => formatDate(role.createdAt),
          },
        ]}
        actions={{
          canUpdate: (role) => canUpdate && isManageable(role),
          deleteDialog: canDelete
            ? (role) =>
                isManageable(role)
                  ? {
                      ...ROLE_DELETE_TEXTS,
                      recordName: role.name,
                      deletePath: `/roles/${role.id}`,
                    }
                  : undefined
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={ShieldCheck}
            pathname='/admin/roles'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={ROLE_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname='/admin/roles' query={listQuery} meta={roles.meta} />}
      />
    </div>
  );
}
