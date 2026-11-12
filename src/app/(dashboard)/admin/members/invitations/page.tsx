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
import type { Invitation } from '@/types/invitation';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

import { InviteMemberDialog } from '../invite-member-dialog';
import { getRoleNames, getRoleOptions, getTeamTabs } from '../members-config';
import {
  getInvitationDeleteTexts,
  getInvitationStatus,
  INVITATION_EMPTY_TEXTS,
  INVITATION_FILTERS,
  INVITATION_STATUS_LABELS,
} from './invitations-config';

export const metadata: Metadata = {
  title: 'Convites',
};

type InvitationsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InvitationsPage({ searchParams }: InvitationsPageProps) {
  const session = await requireSession(['members.read', 'invitations.read']);
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, INVITATION_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, INVITATION_FILTERS),
  );
  const canReadRoles = hasPermission(session, 'roles.read');

  const [invitations, roles, permissions] = await Promise.all([
    apiRequest<Paginated<Invitation>>(`/invitations?${query}`, { token: session.accessToken }),
    canReadRoles
      ? apiRequest<Paginated<Role>>('/roles?limit=100', { token: session.accessToken })
      : null,
    apiRequest<Paginated<Permission>>('/permissions?limit=100', { token: session.accessToken }),
  ]);

  if (invitations.meta.totalPages > 0 && page > invitations.meta.totalPages) {
    redirect(
      buildListHref('/admin/members/invitations', listQuery, invitations.meta.totalPages, pageSize),
    );
  }

  const canDelete = hasPermission(session, 'invitations.delete');
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
        description='Acompanhe os convites enviados e revogue os que não devem mais valer.'
        actions={inviteAction}
        searchPlaceholder='Buscar por e-mail'
        filters={<ListFilters filters={INVITATION_FILTERS} values={filters} />}
      />

      {tabs && <PageTabs label='Seções da equipe' tabs={tabs} />}

      <DataTable
        rows={invitations.data}
        primary={{
          header: 'Convite',
          title: (invitation) => invitation.email,
          subtitle: (invitation) => `Enviado em ${formatDate(invitation.createdAt)}`,
        }}
        columns={[
          ...(roles
            ? [
                {
                  header: 'Cargos',
                  visibleFrom: 'md' as const,
                  cell: (invitation: Invitation) => (
                    <BadgeList labels={getRoleNames(invitation.roleIds, roles.data)} />
                  ),
                },
              ]
            : []),
          {
            header: 'Expira em',
            visibleFrom: 'lg',
            cell: (invitation) => formatDate(invitation.expiresAt),
          },
          {
            header: 'Situação',
            visibleFrom: 'sm',
            cell: (invitation) => {
              const status = INVITATION_STATUS_LABELS[getInvitationStatus(invitation)];

              return <StatusBadge label={status.label} tone={status.tone} />;
            },
          },
        ]}
        actions={{
          canUpdate: false,
          deleteDialog: canDelete
            ? (invitation) => {
                const texts = getInvitationDeleteTexts(getInvitationStatus(invitation));

                return (
                  texts && {
                    ...texts,
                    recordName: invitation.email,
                    deletePath: `/invitations/${invitation.id}`,
                  }
                );
              }
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={UsersRound}
            pathname='/admin/members/invitations'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={inviteAction}
            texts={INVITATION_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination
            pathname='/admin/members/invitations'
            query={listQuery}
            meta={invitations.meta}
          />
        }
      />
    </div>
  );
}
