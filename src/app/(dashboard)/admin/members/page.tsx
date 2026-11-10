import { UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { PageTabs } from '@/components/layout/page-tabs';
import { BadgeList } from '@/components/list/badge-list';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { StatusBadge } from '@/components/list/status-badge';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { MemberDetails } from '@/types/member';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

import { InviteMemberDialog } from './invite-member-dialog';
import {
  getMemberFilters,
  getMemberReadOnlyReason,
  getMemberRemoveTexts,
  getRoleNames,
  getRoleOptions,
  getTeamTabs,
  MEMBER_EMPTY_TEXTS,
} from './members-config';

export const metadata: Metadata = {
  title: 'Equipe',
};

type MembersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const session = await requireSession('members.read');
  const canReadRoles = hasPermission(session, 'roles.read');
  const [roles, permissions] = await Promise.all([
    canReadRoles
      ? apiRequest<Paginated<Role>>('/roles?limit=100', { token: session.accessToken })
      : null,
    apiRequest<Paginated<Permission>>('/permissions?limit=100', { token: session.accessToken }),
  ]);
  const filterDefinitions = getMemberFilters(roles?.data ?? null);
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, filterDefinitions),
  );

  const members = await apiRequest<Paginated<MemberDetails>>(`/members?${query}`, {
    token: session.accessToken,
  });

  if (members.meta.totalPages > 0 && page > members.meta.totalPages) {
    redirect(buildListHref('/admin/members', listQuery, members.meta.totalPages, pageSize));
  }

  const canUpdate = hasPermission(session, 'members.update');
  const canDelete = hasPermission(session, 'members.delete');
  const isReadOnly = (member: MemberDetails) =>
    getMemberReadOnlyReason(member, session, roles?.data ?? null, permissions.data) !== null;
  const tabs = getTeamTabs(session);
  const inviteAction = hasPermission(session, 'invitations.create') && (
    <InviteMemberDialog
      roleOptions={getRoleOptions(roles?.data ?? null, permissions.data, session.permissions)}
    />
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={UsersRound}
        title='Equipe'
        description='Veja quem faz parte da empresa, ative ou desative o acesso e escolha os cargos.'
        actions={inviteAction}
        searchPlaceholder='Buscar por nome ou e-mail'
        filters={<ListFilters filters={filterDefinitions} values={filters} />}
      />

      {tabs && <PageTabs label='Seções da equipe' tabs={tabs} />}

      <DataTable
        rows={members.data}
        rowHref={(member) => `/admin/members/${member.id}`}
        primary={{
          header: 'Membro',
          title: (member) => member.name,
          subtitle: (member) => member.email,
          avatar: true,
        }}
        columns={[
          ...(roles
            ? [
                {
                  header: 'Cargos',
                  visibleFrom: 'md' as const,
                  cell: (member: MemberDetails) => (
                    <BadgeList labels={getRoleNames(member.roleIds, roles.data)} />
                  ),
                },
              ]
            : []),
          {
            header: 'Situação',
            visibleFrom: 'sm',
            cell: (member) => (
              <div className='flex gap-1'>
                {member.active ? (
                  <StatusBadge label='Ativo' tone='success' />
                ) : (
                  <StatusBadge label='Inativo' tone='neutral' />
                )}
                {member.isOwner && <StatusBadge label='Dono' tone='info' />}
              </div>
            ),
          },
          {
            header: 'Desde',
            visibleFrom: 'lg',
            cell: (member) => formatDate(member.createdAt),
          },
        ]}
        actions={{
          canUpdate: (member) => canUpdate && !isReadOnly(member),
          deleteDialog: canDelete
            ? (member) =>
                isReadOnly(member)
                  ? undefined
                  : {
                      ...getMemberRemoveTexts(member.name),
                      recordName: member.name,
                      deletePath: `/members/${member.id}`,
                    }
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={UsersRound}
            pathname='/admin/members'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={inviteAction}
            texts={MEMBER_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname='/admin/members' query={listQuery} meta={members.meta} />}
      />
    </div>
  );
}
