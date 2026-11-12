import { Megaphone } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { FileAttachments } from '@/components/files/file-attachments';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { CommercialAction } from '@/types/commercial-action';

import { getActionFormOptions } from '../action-form-options';
import CommercialActionForm from '../commercial-action-form';
import {
  COMMERCIAL_ACTIONS_HREF,
  formatNames,
  getActionDeleteTexts,
  getActionTitle,
} from '../commercial-actions-config';

type CommercialActionPageProps = {
  params: Promise<{ id: string }>;
};

const EDIT_PERMISSIONS = ['commercial-actions.update', 'events.read', 'wallets.read'];

function getAction(id: string, token: string): Promise<CommercialAction> {
  return getRecordOrNotFound<CommercialAction>(`/commercial-actions/${id}`, token);
}

function formatOptionalDate(value: string | null): string | null {
  return value ? formatDate(value) : null;
}

export async function generateMetadata({ params }: CommercialActionPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'commercial-actions.read')) {
    return { title: 'Ação comercial' };
  }

  const { id } = await params;
  const action = await getAction(id, session.accessToken);

  return { title: getActionTitle(action) };
}

export default async function CommercialActionPage({ params }: CommercialActionPageProps) {
  const session = await requireSession('commercial-actions.read');
  const { id } = await params;
  const canUpdate = EDIT_PERMISSIONS.every((permission) => hasPermission(session, permission));
  const [action, options] = await Promise.all([
    getAction(id, session.accessToken),
    canUpdate ? getActionFormOptions(session) : null,
  ]);
  const title = getActionTitle(action);

  return (
    <RecordPageLayout
      backHref={COMMERCIAL_ACTIONS_HREF}
      backLabel='Ações comerciais'
      icon={Megaphone}
      title={title}
      description={`${action.event.name} · Cadastro criado em ${formatDate(action.createdAt, 'long')}`}
      actions={
        hasPermission(session, 'commercial-actions.delete') && (
          <DeleteRecordButton
            {...getActionDeleteTexts(action)}
            recordName={title}
            deletePath={`/commercial-actions/${action.id}`}
            listHref={COMMERCIAL_ACTIONS_HREF}
          />
        )
      }
    >
      {options ? (
        <CommercialActionForm action={action} {...options} />
      ) : (
        <RecordDetails
          title='Dados da ação'
          fields={[
            { label: 'Evento', value: action.event.name },
            { label: 'Nº da nota', value: action.invoiceNumber },
            { label: 'Descrição', value: action.description, wide: true },
            { label: 'Início', value: formatOptionalDate(action.initialDate) },
            { label: 'Fim', value: formatOptionalDate(action.finalDate) },
            { label: 'Carteira', value: action.wallet.name },
            { label: 'Valor', value: action.price === null ? null : formatCurrency(action.price) },
            { label: 'Produtores convidados', value: formatNames(action.producerGuests), wide: true },
            { label: 'Revendas convidadas', value: formatNames(action.resellerGuests), wide: true },
            { label: 'Responsável', value: action.responsible.name },
            { label: 'Participantes', value: formatNames(action.participants) },
            ...(action.files
              ? [{ label: 'Anexos', value: <FileAttachments files={action.files} />, wide: true }]
              : []),
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
