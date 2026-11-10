import { Plus, Wallet as WalletIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { WalletListItem } from '@/types/wallet';

import {
  getWalletDeleteTexts,
  getWalletRecordName,
  WALLET_EMPTY_TEXTS,
  WALLET_FILTERS,
  WALLETS_HREF,
} from './wallets-config';

export const metadata: Metadata = {
  title: 'Carteiras',
};

type WalletsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WalletsPage({ searchParams }: WalletsPageProps) {
  const session = await requireSession('wallets.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, WALLET_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, WALLET_FILTERS),
  );

  const wallets = await apiRequest<Paginated<WalletListItem>>(`/wallets?${query}`, {
    token: session.accessToken,
  });

  if (wallets.meta.totalPages > 0 && page > wallets.meta.totalPages) {
    redirect(buildListHref(WALLETS_HREF, listQuery, wallets.meta.totalPages, pageSize));
  }

  const canDelete = hasPermission(session, 'wallets.delete');
  const canCreate =
    hasPermission(session, 'wallets.create') && hasPermission(session, 'members.read');
  const createAction = canCreate && (
    <Button href={`${WALLETS_HREF}/new`}>
      <Plus />
      Nova carteira
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={WalletIcon}
        title='Carteiras'
        description='Saldo de cada membro da equipe para as ações comerciais.'
        actions={createAction}
        searchPlaceholder='Buscar pelo nome ou e-mail do membro'
        filters={<ListFilters filters={WALLET_FILTERS} values={filters} />}
      />

      <DataTable
        rows={wallets.data}
        rowHref={(wallet) => `${WALLETS_HREF}/${wallet.id}`}
        primary={{
          header: 'Membro',
          title: (wallet) => wallet.member.name,
          subtitle: (wallet) => wallet.member.email,
          avatar: true,
        }}
        columns={[
          {
            header: 'Saldo',
            align: 'end',
            cell: (wallet) => formatCurrency(wallet.value),
          },
          {
            header: 'Atualizada em',
            visibleFrom: 'md',
            cell: (wallet) => formatDate(wallet.updatedAt),
          },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'wallets.update'),
          deleteDialog: canDelete
            ? (wallet) => ({
                ...getWalletDeleteTexts(wallet),
                recordName: getWalletRecordName(wallet),
                deletePath: `/wallets/${wallet.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={WalletIcon}
            pathname={WALLETS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={WALLET_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname={WALLETS_HREF} query={listQuery} meta={wallets.meta} />}
      />
    </div>
  );
}
