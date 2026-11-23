import { Wallet as WalletIcon } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest, hasRecords } from '@/lib/api';
import { COMBOBOX_SOURCES, type ComboboxOption, isUuid } from '@/lib/combobox-sources';
import { getSearchParam } from '@/lib/list-params';
import { requireSession } from '@/lib/session';
import type { Member } from '@/types/member';

import WalletForm from '../wallet-form';
import { WALLETS_HREF } from '../wallets-config';

export const metadata: Metadata = {
  title: 'Nova carteira',
};

type NewWalletPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getPreselectedMember(id: string, token: string): Promise<ComboboxOption | null> {
  if (!isUuid(id)) {
    return null;
  }

  const member = await apiRequest<Member>(`/members/${id}`, { token }).catch(() => null);

  return member?.active ? COMBOBOX_SOURCES.membersWithoutWallet.toOption(member) : null;
}

export default async function NewWalletPage({ searchParams }: NewWalletPageProps) {
  const session = await requireSession(['wallets.create', 'members.read']);
  const params = await searchParams;
  const [hasAvailableMembers, defaultMember] = await Promise.all([
    hasRecords('/members', session.accessToken, { active: 'true', hasWallet: 'false' }),
    getPreselectedMember(getSearchParam(params, 'member'), session.accessToken),
  ]);

  return (
    <RecordPageLayout
      backHref={WALLETS_HREF}
      backLabel='Carteiras'
      icon={WalletIcon}
      title='Nova carteira'
      description='Escolha o membro e o saldo inicial da carteira.'
    >
      <WalletForm hasAvailableMembers={hasAvailableMembers} defaultMember={defaultMember} />
    </RecordPageLayout>
  );
}
