import { ExternalLink, Wallet as WalletIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { ActionCard } from '@/components/crud/action-card';
import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RelatedRecords } from '@/components/crud/related-records';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { StatCard } from '@/components/layout/stat-card';
import { Button } from '@/components/ui/button';
import { apiRequest, getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { CommercialAction } from '@/types/commercial-action';
import type { Wallet } from '@/types/wallet';

import {
  COMMERCIAL_ACTIONS_HREF,
  toActionRecords,
} from '../../commercial-actions/commercial-actions-config';
import { AddCreditDialog } from '../add-credit-dialog';
import {
  getWalletDeleteTexts,
  getWalletRecordName,
  getWalletTitle,
  WALLETS_HREF,
} from '../wallets-config';

const STATEMENT_LIMIT = 10;

type WalletPageProps = {
  params: Promise<{ id: string }>;
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

export default async function WalletPage({ params }: WalletPageProps) {
  const session = await requireSession('wallets.read');
  const { id } = await params;
  const [wallet, actions] = await Promise.all([
    getWallet(id, session.accessToken),
    hasPermission(session, 'commercial-actions.read')
      ? apiRequest<Paginated<CommercialAction>>(
          `/commercial-actions?walletId=${id}&limit=${STATEMENT_LIMIT}`,
          { token: session.accessToken },
        )
      : null,
  ]);

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
      <StatCard
        label='Saldo atual'
        value={formatCurrency(wallet.value)}
        description='Aumenta com os créditos e diminui com as ações comerciais.'
        icon={WalletIcon}
        action={hasPermission(session, 'wallets.update') && <AddCreditDialog walletId={wallet.id} />}
      />

      {actions && (
        <RelatedRecords
          title='Extrato de ações'
          description='As ações comerciais mais recentes pagas com esta carteira. Os créditos somam direto no saldo.'
          records={toActionRecords(actions.data, 'wallet')}
          total={actions.meta.total}
          emptyMessage='Nenhuma ação comercial usou esta carteira.'
          viewAllHref={`${COMMERCIAL_ACTIONS_HREF}?walletId=${wallet.id}`}
          viewAllLabel='Ver todas'
        />
      )}

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
