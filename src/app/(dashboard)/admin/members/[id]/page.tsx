import { ExternalLink, Plus, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { ActionCard } from '@/components/crud/action-card';
import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { Button } from '@/components/ui/button';
import { apiRequest, getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { MemberDetails } from '@/types/member';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';
import type { WalletListItem } from '@/types/wallet';

import MemberForm from '../member-form';
import {
  getMemberReadOnlyReason,
  getMemberRemoveTexts,
  getRoleNames,
  getRoleOptions,
} from '../members-config';

type MemberPageProps = {
  params: Promise<{ id: string }>;
};

function getMember(id: string, token: string): Promise<MemberDetails> {
  return getRecordOrNotFound<MemberDetails>(`/members/${id}`, token);
}

export async function generateMetadata({ params }: MemberPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'members.read')) {
    return { title: 'Membro' };
  }

  const { id } = await params;
  const member = await getMember(id, session.accessToken);

  return { title: member.name };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const session = await requireSession('members.read');
  const { id } = await params;
  const canReadRoles = hasPermission(session, 'roles.read');
  const [member, roles, permissions, wallets] = await Promise.all([
    getMember(id, session.accessToken),
    canReadRoles
      ? apiRequest<Paginated<Role>>('/roles?limit=100', { token: session.accessToken })
      : null,
    apiRequest<Paginated<Permission>>('/permissions?limit=100', { token: session.accessToken }),
    hasPermission(session, 'wallets.read')
      ? apiRequest<Paginated<WalletListItem>>(`/wallets?userCompanyId=${id}&limit=1`, {
          token: session.accessToken,
        })
      : null,
  ]);
  const wallet = wallets?.data[0];
  const readOnlyReason = getMemberReadOnlyReason(
    member,
    session,
    roles?.data ?? null,
    permissions.data,
  );
  const hasUpdatePermission = hasPermission(session, 'members.update');
  const canUpdate = hasUpdatePermission && !readOnlyReason;
  const canRemove = hasPermission(session, 'members.delete') && !readOnlyReason;
  const roleOptions = getRoleOptions(roles?.data ?? null, permissions.data, session.permissions);
  const status = [member.active ? 'Ativo' : 'Inativo', member.isOwner && 'Dono']
    .filter(Boolean)
    .join(' · ');

  return (
    <RecordPageLayout
      backHref='/admin/members'
      backLabel='Equipe'
      icon={UsersRound}
      title={member.name}
      description={`${member.email} · Membro desde ${formatDate(member.createdAt, 'long')}`}
      actions={
        canRemove && (
          <DeleteRecordButton
            {...getMemberRemoveTexts(member.name)}
            recordName={member.name}
            deletePath={`/members/${member.id}`}
            listHref='/admin/members'
          />
        )
      }
    >
      {canUpdate ? (
        <MemberForm member={member} roleOptions={roleOptions} />
      ) : (
        <RecordDetails
          title='Acesso à empresa'
          description={hasUpdatePermission && readOnlyReason ? readOnlyReason : undefined}
          fields={[
            { label: 'E-mail', value: member.email },
            { label: 'Situação', value: status },
            ...(roles
              ? [{ label: 'Cargos', value: getRoleNames(member.roleIds, roles.data).join(', '), wide: true }]
              : []),
          ]}
        />
      )}

      {hasPermission(session, 'employees.read') && (
        <ActionCard
          title='Funcionário vinculado'
          description={
            member.employee
              ? `${member.employee.person.name} é o cadastro de funcionário deste membro.`
              : 'Este membro não está ligado a nenhum funcionário. O vínculo é feito no cadastro do funcionário.'
          }
          action={
            member.employee &&
            hasPermission(session, 'persons.read') && (
              <Button href={`/admin/employees/${member.employee.person.id}`} variant='outline'>
                <ExternalLink />
                Abrir funcionário
              </Button>
            )
          }
        />
      )}

      {wallets && (
        <ActionCard
          title='Carteira'
          description={
            wallet
              ? `Saldo de ${formatCurrency(wallet.value)} para as ações comerciais.`
              : 'Este membro ainda não tem carteira para as ações comerciais.'
          }
          action={
            wallet ? (
              <Button href={`/admin/wallets/${wallet.id}`} variant='outline'>
                <ExternalLink />
                Abrir carteira
              </Button>
            ) : (
              member.active &&
              hasPermission(session, 'wallets.create') && (
                <Button href={`/admin/wallets/new?member=${member.id}`} variant='outline'>
                  <Plus />
                  Criar carteira
                </Button>
              )
            )
          }
        />
      )}
    </RecordPageLayout>
  );
}
