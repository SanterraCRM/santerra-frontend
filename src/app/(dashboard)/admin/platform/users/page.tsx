import { Plus, UserCog } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { StatusBadge } from '@/components/list/status-badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { PlatformUser } from '@/types/platform';

import {
  PLATFORM_USER_EMPTY_TEXTS,
  PLATFORM_USER_FILTERS,
  PLATFORM_USERS_HREF,
} from './users-config';

export const metadata: Metadata = {
  title: 'Usuários',
};

type PlatformUsersPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PlatformUsersPage({ searchParams }: PlatformUsersPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, PLATFORM_USER_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, PLATFORM_USER_FILTERS),
  );

  const users = await apiRequest<Paginated<PlatformUser>>(`/users?${query}`, {
    token: session.accessToken,
  });

  if (users.meta.totalPages > 0 && page > users.meta.totalPages) {
    redirect(buildListHref(PLATFORM_USERS_HREF, listQuery, users.meta.totalPages, pageSize));
  }

  const createAction = (
    <Button href={`${PLATFORM_USERS_HREF}/new`}>
      <Plus />
      Novo usuário
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={UserCog}
        title='Usuários'
        description='Todas as contas da plataforma. Desative quem não deve mais entrar.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou e-mail'
        filters={<ListFilters filters={PLATFORM_USER_FILTERS} values={filters} />}
      />

      <DataTable
        rows={users.data}
        rowHref={(user) => `${PLATFORM_USERS_HREF}/${user.id}`}
        primary={{
          header: 'Usuário',
          title: (user) => user.name,
          subtitle: (user) => user.email,
          avatar: true,
        }}
        columns={[
          {
            header: 'Situação',
            cell: (user) => (
              <span className='flex flex-wrap gap-1'>
                <StatusBadge
                  label={user.active ? 'Ativo' : 'Inativo'}
                  tone={user.active ? 'success' : 'neutral'}
                />
                {user.isPlatformAdmin && <StatusBadge label='Plataforma' tone='info' />}
              </span>
            ),
          },
          {
            header: 'Último acesso',
            visibleFrom: 'md',
            cell: (user) => (user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'),
          },
          {
            header: 'Cadastro',
            visibleFrom: 'lg',
            cell: (user) => formatDate(user.createdAt),
          },
        ]}
        actions={{ canUpdate: true }}
        emptyState={
          <ListEmptyState
            icon={UserCog}
            pathname={PLATFORM_USERS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={PLATFORM_USER_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={PLATFORM_USERS_HREF} query={listQuery} meta={users.meta} />}
      />
    </div>
  );
}
