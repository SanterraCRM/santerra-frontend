import Link from 'next/link';
import type { ReactNode } from 'react';

import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import { formatNationalId } from '@/lib/format';
import type { FilterDefinition } from '@/lib/list-filters';
import type { PogPoc, PogPocFilterOptions } from '@/types/pog-poc';

import { RESELLERS_HREF } from '../resellers/resellers-config';

export const POG_POC_HREF = '/admin/pog-poc';

export function getPogPocFilters(options: PogPocFilterOptions): FilterDefinition[] {
  if (options.regioes.length === 0) {
    return [];
  }

  return [
    {
      type: 'select',
      key: 'regiao',
      label: 'Região',
      options: options.regioes.map((regiao) => ({ value: regiao, label: regiao })),
    },
  ];
}

export type PogPocRow = PogPoc & { id: string };

export function toPogPocRows(pogPocs: PogPoc[]): PogPocRow[] {
  return pogPocs.map((pogPoc, index) => ({
    ...pogPoc,
    id: [pogPoc.codigo_produto, pogPoc.cnpj, pogPoc.regiao, index].join('-'),
  }));
}

export function getPogPocProductName(pogPoc: Pick<PogPoc, 'produto'>): string {
  return pogPoc.produto || 'Produto sem nome';
}

export function formatPogPocCnpj(cnpj: string | null): string {
  return cnpj ? formatNationalId(cnpj) : '—';
}

export function renderPogPocReseller(pogPoc: PogPoc, canReadResellers: boolean): ReactNode {
  if (!pogPoc.reseller) {
    return <span className='text-muted-foreground'>Revenda não encontrada</span>;
  }

  if (!canReadResellers) {
    return pogPoc.reseller.name;
  }

  return (
    <Link
      href={`${RESELLERS_HREF}/${pogPoc.reseller.id}`}
      className='font-medium underline-offset-4 hover:underline'
    >
      {pogPoc.reseller.name}
    </Link>
  );
}

export const POG_POC_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum POG/POC encontrado',
  filtersDescription: 'Nenhum POG/POC corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque pelo código do produto ou CNPJ.',
  emptyTitle: 'Nenhum POG/POC disponível',
  emptyDescription: 'Quando a API retornar dados de POG/POC, eles aparecerão aqui.',
  emptyReadOnlyDescription: 'Quando a API retornar dados de POG/POC, eles aparecerão aqui.',
};
