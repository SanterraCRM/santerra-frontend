import { ChartColumn } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { DataTable } from '@/components/list/data-table';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { hasPermission, requireSession } from '@/lib/session';
import type { PogPoc } from '@/types/pog-poc';

import { RESELLERS_HREF } from '../../resellers/resellers-config';
import {
  formatPogPocCnpj,
  getPogPocProductName,
  POG_POC_HREF,
  toPogPocRows,
} from '../pog-poc-config';

type PogPocProductPageProps = {
  params: Promise<{ id: string }>;
};

function getPogPocs(id: string, token: string): Promise<PogPoc[]> {
  return getRecordOrNotFound<PogPoc[]>(`/pog-poc/${id}`, token);
}

export async function generateMetadata({ params }: PogPocProductPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { title: 'POG/POC' };
  }

  const { id } = await params;
  const [pogPoc] = await getPogPocs(id, session.accessToken);

  return { title: `POG/POC · ${getPogPocProductName(pogPoc)}` };
}

export default async function PogPocProductPage({ params }: PogPocProductPageProps) {
  const session = await requireSession();
  const { id } = await params;
  const pogPocs = await getPogPocs(id, session.accessToken);
  const [product] = pogPocs;
  const productName = getPogPocProductName(product);
  const canReadResellers = hasPermission(session, 'resellers.read');

  return (
    <RecordPageLayout
      backHref={POG_POC_HREF}
      backLabel='POG/POC'
      icon={ChartColumn}
      title={productName}
      description={`Código ${id}`}
    >
      <RecordDetails
        title='Produto'
        description='Dados consultados na API externa, disponíveis apenas para consulta.'
        fields={[
          { label: 'Nome', value: product.produto },
          { label: 'Código', value: product.codigo_produto },
          { label: 'Registros do produto', value: pogPocs.length },
        ]}
      />

      <DataTable
        rows={toPogPocRows(pogPocs)}
        primary={{
          header: 'Revendas associadas',
          title: (pogPoc) => pogPoc.reseller?.name ?? 'Revenda não encontrada',
          subtitle: (pogPoc) => formatPogPocCnpj(pogPoc.cnpj),
        }}
        rowHref={(pogPoc) =>
          canReadResellers && pogPoc.reseller
            ? `${RESELLERS_HREF}/${pogPoc.reseller.id}`
            : undefined
        }
        columns={[
          { header: 'Região', visibleFrom: 'sm', cell: (pogPoc) => pogPoc.regiao ?? '—' },
          { header: 'POG', align: 'end', cell: (pogPoc) => pogPoc.pog ?? '—' },
          { header: 'POC', align: 'end', cell: (pogPoc) => pogPoc.poc ?? '—' },
        ]}
        emptyState={null}
      />
    </RecordPageLayout>
  );
}
