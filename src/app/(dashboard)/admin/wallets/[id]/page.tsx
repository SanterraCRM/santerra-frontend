import { ArrowDownLeft, ArrowUpRight, ExternalLink, Wallet as WalletIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { ActionCard } from '@/components/crud/action-card';
import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { SectionHeader } from '@/components/layout/section-header';
import { StatCard } from '@/components/layout/stat-card';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { ListQuickFilters } from '@/components/list/list-quick-filters';
import { Button } from '@/components/ui/button';
import { apiRequest, getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import {
  buildApiListQuery,
  buildListHref,
  getSearchParam,
  parseListParams,
} from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Wallet, WalletMovement, WalletMovementsSummary } from '@/types/wallet';

import { AdjustBalanceDialog } from '../adjust-balance-dialog';
import {
  formatMovementDate,
  formatSignedCurrency,
  getMovementHref,
  getMovementSubtitle,
  getMovementTitle,
  getWalletDeleteTexts,
  getWalletRecordName,
  getWalletTitle,
  WALLET_MOVEMENT_DIRECTIONS,
  WALLET_MOVEMENT_EMPTY_TEXTS,
  WALLET_MOVEMENT_FILTERS,
  WALLETS_HREF,
} from '../wallets-config';

type WalletPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getWallet(id: string, token: string): Promise<Wallet> {
  return getRecordOrNotFound<Wallet>(`/wallets/${id}`, token);
}

export async function generateMetadata({ params }: WalletPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'wallets.read')) {
    return { title: 'Carteira' };
  }

  const { id } = await params;
  const wallet = await getWallet(id, session.accessToken);

  return { title: getWalletTitle(wallet) };
}

export default async function WalletPage({ params, searchParams }: WalletPageProps) {
  const session = await requireSession('wallets.read');
  const token = session.accessToken;
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const wallet = await getWallet(id, token);
  const pathname = `${WALLETS_HREF}/${wallet.id}`;
  const { page, pageSize } = parseListParams(query);
  const filters = parseFilters(query, WALLET_MOVEMENT_FILTERS);
  const directionParam = getSearchParam(query, 'direction');
  const direction = WALLET_MOVEMENT_DIRECTIONS.some(({ value }) => value === directionParam)
    ? directionParam
    : '';
  const apiFilters = toApiFilters(filters, WALLET_MOVEMENT_FILTERS);
  const listQuery = { ...filters, direction };
  const movementsQuery = buildApiListQuery({ page, pageSize, search: '' }, { ...apiFilters, direction });
  const periodQuery = buildApiListQuery(
    { page: 1, pageSize, search: '' },
    { createdFrom: apiFilters.createdFrom, createdTo: apiFilters.createdTo },
  );

  const [movements, summary] = await Promise.all([
    apiRequest<Paginated<WalletMovement>>(`/wallets/${wallet.id}/movements?${movementsQuery}`, {
      token,
    }),
    apiRequest<WalletMovementsSummary>(`/wallets/${wallet.id}/movements/summary?${periodQuery}`, {
      token,
    }),
  ]);

  if (movements.meta.totalPages > 0 && page > movements.meta.totalPages) {
    redirect(buildListHref(pathname, listQuery, movements.meta.totalPages, pageSize));
  }

  const hasPeriod = Boolean(filters.createdFrom || filters.createdTo);
  const periodDescription = hasPeriod ? 'No período filtrado.' : 'Desde o início do extrato.';

  return (
    <RecordPageLayout
      backHref={WALLETS_HREF}
      backLabel='Carteiras'
      icon={WalletIcon}
      title={getWalletTitle(wallet)}
      description={`${wallet.member.email} · Atualizada em ${formatDate(wallet.updatedAt, 'long')}`}
      actions={
        hasPermission(session, 'wallets.delete') && (
          <DeleteRecordButton
            {...getWalletDeleteTexts(wallet)}
            recordName={getWalletRecordName(wallet)}
            deletePath={`/wallets/${wallet.id}`}
            listHref={WALLETS_HREF}
          />
        )
      }
    >
      <ul aria-label='Saldo, entradas e saídas' className='grid gap-4 sm:grid-cols-2'>
        <li className='sm:col-span-2'>
          <StatCard
            label='Saldo atual'
            value={formatCurrency(wallet.value)}
            description='A soma de todas as movimentações do extrato.'
            icon={WalletIcon}
            action={
              hasPermission(session, 'wallets.adjust') && (
                <AdjustBalanceDialog walletId={wallet.id} balance={wallet.value} />
              )
            }
          />
        </li>
        <li>
          <StatCard
            label='Entradas'
            value={formatCurrency(summary.credits)}
            description={periodDescription}
            icon={ArrowDownLeft}
          />
        </li>
        <li>
          <StatCard
            label='Saídas'
            value={formatCurrency(summary.debits)}
            description={periodDescription}
            icon={ArrowUpRight}
          />
        </li>
      </ul>

      <section className='flex flex-col gap-4'>
        <SectionHeader
          title='Extrato'
          description='Cada acréscimo, desconto e débito de ação, do mais recente para o mais antigo.'
          actions={<ListFilters filters={WALLET_MOVEMENT_FILTERS} values={filters} />}
        />
        <ListQuickFilters
          label='Entradas e saídas'
          param='direction'
          options={WALLET_MOVEMENT_DIRECTIONS}
          pathname={pathname}
          query={listQuery}
          pageSize={pageSize}
        />
        <DataTable
          rows={movements.data}
          rowHref={getMovementHref}
          primary={{
            header: 'Movimentação',
            title: getMovementTitle,
            subtitle: (movement) => (
              <>
                <span className='sm:hidden'>{formatMovementDate(movement.createdAt)} · </span>
                {getMovementSubtitle(movement)}
              </>
            ),
          }}
          columns={[
            {
              header: 'Data',
              visibleFrom: 'sm',
              cell: (movement) => formatMovementDate(movement.createdAt),
            },
            {
              header: 'Autor',
              visibleFrom: 'md',
              cell: (movement) => movement.createdBy?.name ?? '—',
            },
            {
              header: 'Valor',
              align: 'end',
              cell: (movement) => (
                <span
                  className={cn(
                    'font-medium whitespace-nowrap',
                    movement.amount > 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-foreground',
                  )}
                >
                  {formatSignedCurrency(movement.amount)}
                </span>
              ),
            },
            {
              header: 'Saldo',
              align: 'end',
              visibleFrom: 'sm',
              cell: (movement) => formatCurrency(movement.balanceAfter),
            },
          ]}
          emptyState={
            <ListEmptyState
              icon={WalletIcon}
              pathname={pathname}
              searchTerm=''
              hasFilters={Object.values(listQuery).some(Boolean)}
              texts={WALLET_MOVEMENT_EMPTY_TEXTS}
            />
          }
          footer={<ListPagination pathname={pathname} query={listQuery} meta={movements.meta} />}
        />
      </section>

      {hasPermission(session, 'members.read') && (
        <ActionCard
          title='Membro'
          description={`${wallet.member.name} (${wallet.member.email}) é o dono desta carteira.`}
          action={
            <Button href={`/admin/members/${wallet.member.id}`} variant='outline'>
              <ExternalLink />
              Abrir membro
            </Button>
          }
        />
      )}
    </RecordPageLayout>
  );
}
