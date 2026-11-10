import { Wallet as WalletIcon } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest } from '@/lib/api';
import { getSearchParam } from '@/lib/list-params';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Member } from '@/types/member';

import WalletForm from '../wallet-form';
import { WALLETS_HREF } from '../wallets-config';

export const metadata: Metadata = {
  title: 'Nova carteira',
};

type NewWalletPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewWalletPage({ searchParams }: NewWalletPageProps) {
  const session = await requireSession(['wallets.create', 'members.read']);
  const [params, members] = await Promise.all([
    searchParams,
    apiRequest<Paginated<Member>>('/members?limit=100&active=true&hasWallet=false', {
      token: session.accessToken,
    }),
  ]);
  const memberOptions = members.data.map(({ id, name, email }) => ({
    value: id,
    label: `${name} (${email})`,
  }));
  const preselected = getSearchParam(params, 'member');

  return (
    <RecordPageLayout
      backHref={WALLETS_HREF}
      backLabel='Carteiras'
      icon={WalletIcon}
      title='Nova carteira'
      description='Escolha o membro e o saldo inicial da carteira.'
    >
      <WalletForm
        memberOptions={memberOptions}
        defaultMemberId={memberOptions.some(({ value }) => value === preselected) ? preselected : ''}
      />
    </RecordPageLayout>
  );
}
