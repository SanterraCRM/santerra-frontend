import { ChartColumn } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { apiRequest } from '@/lib/api';
import { normalizeDocumentSearch } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { PogPoc } from '@/types/pog-poc';

import {
  formatPogPocCnpj,
  getPogPocFilters,
  getPogPocProductName,
  POG_POC_EMPTY_TEXTS,
  POG_POC_HREF,
  renderPogPocReseller,
  toPogPocRows,
} from './pog-poc-config';
import { getPogPocFilterOptions } from './pog-poc-options';

export const metadata: Metadata = {
  title: 'POG/POC',
};

type PogPocPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PogPocPage({ searchParams }: PogPocPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const filterDefinitions = getPogPocFilters(await getPogPocFilterOptions(session));
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: normalizeDocumentSearch(searchTerm) },
    toApiFilters(filters, filterDefinitions),
  );

  const pogPocs = await apiRequest<Paginated<PogPoc>>(`/pog-poc?${query}`, {
    token: session.accessToken,
  });

  if (pogPocs.meta.totalPages > 0 && page > pogPocs.meta.totalPages) {
    redirect(buildListHref(POG_POC_HREF, listQuery, pogPocs.meta.totalPages, pageSize));
  }

  const canReadResellers = hasPermission(session, 'resellers.read');

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={ChartColumn}
        title='POG/POC'
        description='POG e POC por produto e revenda.'
        searchPlaceholder='Buscar por produto, código ou CNPJ'
        filters={
          filterDefinitions.length > 0 && (
            <ListFilters filters={filterDefinitions} values={filters} />
          )
        }
      />

      <DataTable
        rows={toPogPocRows(pogPocs.data)}
        rowHref={(pogPoc) =>
          pogPoc.codigo_produto === null ? undefined : `${POG_POC_HREF}/${pogPoc.codigo_produto}`
        }
        primary={{
          header: 'Produto',
          title: getPogPocProductName,
          subtitle: (pogPoc) =>
            pogPoc.codigo_produto === null ? 'Sem código' : `Código ${pogPoc.codigo_produto}`,
        }}
        columns={[
          {
            header: 'Revenda',
            visibleFrom: 'md',
            cell: (pogPoc) => (
              <div className='flex flex-col'>
                {renderPogPocReseller(pogPoc, canReadResellers)}
                <span className='text-xs text-muted-foreground'>
                  {formatPogPocCnpj(pogPoc.cnpj)}
                </span>
              </div>
            ),
          },
          {
            header: 'Região',
            visibleFrom: 'lg',
            cell: (pogPoc) => pogPoc.regiao ?? '—',
          },
          {
            header: 'POG',
            visibleFrom: 'sm',
            align: 'end',
            cell: (pogPoc) => pogPoc.pog ?? '—',
          },
          {
            header: 'POC',
            visibleFrom: 'sm',
            align: 'end',
            cell: (pogPoc) => pogPoc.poc ?? '—',
          },
        ]}
        emptyState={
          <ListEmptyState
            icon={ChartColumn}
            pathname={POG_POC_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            texts={POG_POC_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={POG_POC_HREF} query={listQuery} meta={pogPocs.meta} />}
      />
    </div>
  );
}
