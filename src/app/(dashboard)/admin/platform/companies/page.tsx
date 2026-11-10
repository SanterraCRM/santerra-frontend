import { Building, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { PlatformCompany } from '@/types/platform';

import {
  formatMembersCount,
  PLATFORM_COMPANIES_HREF,
  PLATFORM_COMPANY_EMPTY_TEXTS,
} from './companies-config';

export const metadata: Metadata = {
  title: 'Empresas',
};

type PlatformCompaniesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PlatformCompaniesPage({ searchParams }: PlatformCompaniesPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const listQuery = { search: searchTerm };
  const query = buildApiListQuery({ page, pageSize, search: searchTerm });

  const companies = await apiRequest<Paginated<PlatformCompany>>(`/companies?${query}`, {
    token: session.accessToken,
  });

  if (companies.meta.totalPages > 0 && page > companies.meta.totalPages) {
    redirect(buildListHref(PLATFORM_COMPANIES_HREF, listQuery, companies.meta.totalPages, pageSize));
  }

  const createAction = (
    <Button href={`${PLATFORM_COMPANIES_HREF}/new`}>
      <Plus />
      Nova empresa
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Building}
        title='Empresas'
        description='Todas as empresas da plataforma, com o dono e o tamanho da equipe.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou descrição'
      />

      <DataTable
        rows={companies.data}
        rowHref={(company) => `${PLATFORM_COMPANIES_HREF}/${company.id}`}
        primary={{
          header: 'Empresa',
          title: (company) => company.name,
          subtitle: (company) => company.description ?? 'Sem descrição',
          avatar: true,
        }}
        columns={[
          {
            header: 'Dono',
            visibleFrom: 'sm',
            cell: (company) => company.owner?.name ?? 'Sem dono',
          },
          {
            header: 'Equipe',
            visibleFrom: 'md',
            cell: (company) => formatMembersCount(company.membersCount),
          },
          {
            header: 'Cadastro',
            visibleFrom: 'lg',
            cell: (company) => formatDate(company.createdAt),
          },
        ]}
        actions={{ canUpdate: true }}
        emptyState={
          <ListEmptyState
            icon={Building}
            pathname={PLATFORM_COMPANIES_HREF}
            searchTerm={searchTerm}
            hasFilters={false}
            createAction={createAction}
            texts={PLATFORM_COMPANY_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination pathname={PLATFORM_COMPANIES_HREF} query={listQuery} meta={companies.meta} />
        }
      />
    </div>
  );
}
