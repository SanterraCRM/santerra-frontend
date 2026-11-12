import { Megaphone, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { resolveComboboxOption } from '@/lib/combobox-sources';
import { formatCurrency } from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import {
  buildApiListQuery,
  buildListHref,
  getSearchParam,
  parseListParams,
} from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { CommercialAction } from '@/types/commercial-action';
import type { Event } from '@/types/event';
import type { WalletListItem } from '@/types/wallet';

import {
  ACTION_EMPTY_TEXTS,
  COMMERCIAL_ACTIONS_HREF,
  formatGuestsCount,
  formatPeriod,
  getActionDeleteTexts,
  getActionFilters,
  getActionTitle,
} from './commercial-actions-config';

const CREATE_PERMISSIONS = [
  'commercial-actions.create',
  'events.read',
  'wallets.read',
  'employees.read',
];

export const metadata: Metadata = {
  title: 'Ações comerciais',
};

type CommercialActionsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CommercialActionsPage({ searchParams }: CommercialActionsPageProps) {
  const session = await requireSession('commercial-actions.read');
  const params = await searchParams;
  const token = session.accessToken;
  const can = (permission: string) => hasPermission(session, permission);
  const [events, wallets, responsible] = await Promise.all([
    can('events.read') ? apiRequest<Paginated<Event>>('/events?limit=100', { token }) : null,
    can('wallets.read') ? apiRequest<Paginated<WalletListItem>>('/wallets?limit=100', { token }) : null,
    can('employees.read')
      ? resolveComboboxOption('employees', getSearchParam(params, 'responsibleId'), token)
      : null,
  ]);
  const filterDefinitions = getActionFilters({
    events: events?.data.map(({ id, name }) => ({ value: id, label: name })) ?? null,
    wallets: wallets?.data.map(({ id, member }) => ({ value: id, label: member.name })) ?? null,
    responsible,
    canSearchEmployees: can('employees.read'),
  });
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, filterDefinitions);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: searchTerm },
    toApiFilters(filters, filterDefinitions),
  );

  const actions = await apiRequest<Paginated<CommercialAction>>(`/commercial-actions?${query}`, {
    token,
  });

  if (actions.meta.totalPages > 0 && page > actions.meta.totalPages) {
    redirect(buildListHref(COMMERCIAL_ACTIONS_HREF, listQuery, actions.meta.totalPages, pageSize));
  }

  const canCreate = CREATE_PERMISSIONS.every(can);
  const createAction = canCreate && (
    <Button href={`${COMMERCIAL_ACTIONS_HREF}/new`}>
      <Plus />
      Nova ação
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Megaphone}
        title='Ações comerciais'
        description='Ações da equipe nos eventos, pagas com a carteira de um membro.'
        actions={createAction}
        searchPlaceholder='Buscar pela descrição ou pelo evento'
        filters={<ListFilters filters={filterDefinitions} values={filters} />}
      />

      <DataTable
        rows={actions.data}
        rowHref={(action) => `${COMMERCIAL_ACTIONS_HREF}/${action.id}`}
        primary={{
          header: 'Ação',
          title: getActionTitle,
          subtitle: formatGuestsCount,
        }}
        columns={[
          { header: 'Evento', visibleFrom: 'md', cell: (action) => action.event.name },
          { header: 'Responsável', visibleFrom: 'xl', cell: (action) => action.responsible.name },
          { header: 'Período', visibleFrom: 'lg', cell: formatPeriod },
          {
            header: 'Valor',
            visibleFrom: 'sm',
            align: 'end',
            cell: (action) => (action.price === null ? '—' : formatCurrency(action.price)),
          },
          { header: 'Nota', visibleFrom: 'xl', cell: (action) => action.invoiceNumber ?? '—' },
        ]}
        actions={{
          canUpdate: can('commercial-actions.update'),
          deleteDialog: can('commercial-actions.delete')
            ? (action) => ({
                ...getActionDeleteTexts(action),
                recordName: getActionTitle(action),
                deletePath: `/commercial-actions/${action.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Megaphone}
            pathname={COMMERCIAL_ACTIONS_HREF}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={ACTION_EMPTY_TEXTS}
          />
        }
        footer={
          <ListPagination pathname={COMMERCIAL_ACTIONS_HREF} query={listQuery} meta={actions.meta} />
        }
      />
    </div>
  );
}
