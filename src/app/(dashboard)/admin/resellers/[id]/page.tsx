import { Store } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatCalendarDate, formatCurrency, formatNationalId } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { ResellerView } from '@/types/reseller';

import {
  formatDddPhone,
  getResellerDeleteTexts,
  getResellerName,
  isResellerActive,
  RESELLERS_HREF,
} from '../resellers-config';

type ResellerPageProps = {
  params: Promise<{ id: string }>;
};

const READ_ONLY_DESCRIPTION = 'Dados disponíveis apenas para consulta.';

function getReseller(id: string, token: string): Promise<ResellerView> {
  return getRecordOrNotFound<ResellerView>(`/resellers/${id}`, token);
}

function formatOptionalDate(value: string | null): string | null {
  return value ? formatCalendarDate(value) : null;
}

function formatOptionalCurrency(value: number | null): string | null {
  return value === null ? null : formatCurrency(value);
}

function withCode(label: string | null, code: string | null): string | null {
  if (!label) {
    return code;
  }

  return code ? `${label} (${code})` : label;
}

function formatStreet(reseller: ResellerView): string | null {
  const street = [reseller.street, reseller.number].filter(Boolean).join(', ');
  const full = [street, reseller.complement].filter(Boolean).join(' · ');

  return full || reseller.address;
}

function formatCity(reseller: ResellerView): string | null {
  return [reseller.city, reseller.state].filter(Boolean).join(' / ') || null;
}

export async function generateMetadata({ params }: ResellerPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'resellers.read')) {
    return { title: 'Revenda' };
  }

  const { id } = await params;
  const reseller = await getReseller(id, session.accessToken);

  return { title: getResellerName(reseller) };
}

export default async function ResellerPage({ params }: ResellerPageProps) {
  const session = await requireSession('resellers.read');
  const { id } = await params;
  const reseller = await getReseller(id, session.accessToken);
  const canDelete = hasPermission(session, 'resellers.delete');
  const resellerName = getResellerName(reseller);
  const status = isResellerActive(reseller) ? 'Ativo' : 'Inativo';

  return (
    <RecordPageLayout
      backHref={RESELLERS_HREF}
      backLabel='Revendas'
      icon={Store}
      title={resellerName}
      description={[
        `Código ${reseller.id}`,
        status,
        reseller.createdAt && `Cadastro em ${formatCalendarDate(reseller.createdAt, 'long')}`,
      ]
        .filter(Boolean)
        .join(' · ')}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...getResellerDeleteTexts(0)}
            recordName={resellerName}
            deletePath={`/resellers/${reseller.id}`}
            listHref={RESELLERS_HREF}
          />
        )
      }
    >
      <RecordDetails
        title='Dados da revenda'
        description={READ_ONLY_DESCRIPTION}
        fields={[
          { label: 'Razão social', value: reseller.name, wide: true },
          { label: 'Nome fantasia', value: reseller.fantasyName },
          { label: 'Código', value: reseller.id },
          { label: 'CNPJ/CPF', value: reseller.document && formatNationalId(reseller.document) },
          { label: 'Tipo de pessoa', value: reseller.legalType },
          {
            label: 'Inscrição',
            value: [reseller.registrationType, reseller.registration].filter(Boolean).join(' · '),
          },
          { label: 'CNAE', value: reseller.cnae },
          { label: 'Ramo de atividade', value: reseller.activity },
          { label: 'Data de fundação', value: formatOptionalDate(reseller.foundationDate) },
          { label: 'Situação', value: status },
          { label: 'Data de cadastro', value: formatOptionalDate(reseller.createdAt) },
          { label: 'Empresa (ERP)', value: reseller.companyId },
        ]}
      />

      <RecordDetails
        title='Contato'
        description={READ_ONLY_DESCRIPTION}
        fields={[
          { label: 'E-mail', value: reseller.email, wide: true },
          {
            label: 'Telefone',
            value: formatDddPhone(reseller.clientPhoneDDD, reseller.clientPhone),
          },
          { label: 'Contato', value: reseller.contactName },
          { label: 'Cargo do contato', value: reseller.contactPosition },
          { label: 'E-mail do contato', value: reseller.contactEmail },
          {
            label: 'Telefone do contato',
            value: formatDddPhone(reseller.contactDDD, reseller.contactPhone),
          },
        ]}
      />

      <RecordDetails
        title='Endereço'
        description={READ_ONLY_DESCRIPTION}
        fields={[
          { label: 'Logradouro', value: formatStreet(reseller), wide: true },
          { label: 'Bairro', value: reseller.neighborhood },
          { label: 'Cidade / UF', value: formatCity(reseller) },
          { label: 'CEP', value: reseller.cep },
        ]}
      />

      <RecordDetails
        title='Comercial'
        description={READ_ONLY_DESCRIPTION}
        fields={[
          { label: 'Grupo de cliente', value: withCode(reseller.clientGroup, reseller.clientGroupCode) },
          { label: 'Área', value: withCode(reseller.area, reseller.areaCode) },
          { label: 'Vendedor (código)', value: reseller.sellerCode },
          { label: 'Rota', value: reseller.route },
          { label: 'Tipo de pedido', value: reseller.orderType },
          { label: 'Coligação', value: reseller.affiliation },
          { label: 'Situação de crédito', value: reseller.creditStatus },
          { label: 'Limite de crédito', value: formatOptionalCurrency(reseller.creditLimitValue) },
          { label: 'Última compra', value: formatOptionalDate(reseller.lastBuyDate) },
          { label: 'Valor da última compra', value: formatOptionalCurrency(reseller.lastBuyValue) },
        ]}
      />
    </RecordPageLayout>
  );
}
