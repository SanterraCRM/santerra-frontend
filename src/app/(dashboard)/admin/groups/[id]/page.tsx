import { Layers } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Group } from '@/types/group';

import GroupForm from '../group-form';
import { formatProductsCount, getGroupDeleteTexts } from '../groups-config';

type GroupPageProps = {
  params: Promise<{ id: string }>;
};

function getGroup(id: string, token: string): Promise<Group> {
  return getRecordOrNotFound<Group>(`/groups/${id}`, token);
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'groups.read')) {
    return { title: 'Grupo de produtos' };
  }

  const { id } = await params;
  const group = await getGroup(id, session.accessToken);

  return { title: group.name };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const session = await requireSession('groups.read');
  const { id } = await params;
  const group = await getGroup(id, session.accessToken);
  const canUpdate = hasPermission(session, 'groups.update');
  const canDelete = hasPermission(session, 'groups.delete');

  return (
    <RecordPageLayout
      backHref='/admin/groups'
      backLabel='Grupos de produtos'
      icon={Layers}
      title={group.name}
      description={`${formatProductsCount(group.productsCount)} · Cadastro criado em ${formatDate(group.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...getGroupDeleteTexts(group.productsCount)}
            recordName={group.name}
            deletePath={`/groups/${group.id}`}
            listHref='/admin/groups'
          />
        )
      }
    >
      {canUpdate ? (
        <GroupForm group={group} />
      ) : (
        <RecordDetails
          title='Dados do grupo'
          fields={[
            { label: 'Nome', value: group.name },
            { label: 'Descrição', value: group.description, wide: true },
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
