import { UserPlus } from 'lucide-react';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { BadgeList } from '@/components/list/badge-list';
import { DataTable, type DataTableColumn } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import {
  formatDate,
  formatDecimal,
  formatNationalId,
  formatPhone,
  normalizeDocumentSearch,
} from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import {
  buildApiListQuery,
  buildListHref,
  parseListParams,
  type SearchParams,
} from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Person, PersonType } from '@/types/person';

import { canDeletePerson, getCreatablePersonTypes } from './person-types';
import {
  getEmployeeStatus,
  getPersonDeleteTexts,
  PERSON_TYPE_LABELS,
  type PersonSection,
} from './persons-config';

const TYPE_COLUMN: DataTableColumn<Person> = {
  header: 'Tipo',
  visibleFrom: 'sm',
  cell: (person) => <BadgeList labels={person.types.map((type) => PERSON_TYPE_LABELS[type])} />,
};

const NATIONAL_ID_COLUMN: DataTableColumn<Person> = {
  header: 'CPF/CNPJ',
  cell: (person) => (person.nationalId ? formatNationalId(person.nationalId) : '—'),
};

const PHONE_COLUMN: DataTableColumn<Person> = {
  header: 'Telefone',
  cell: (person) => (person.phoneNumber ? formatPhone(person.phoneNumber) : '—'),
};

const PERSON_COLUMNS: DataTableColumn<Person>[] = [
  TYPE_COLUMN,
  { ...NATIONAL_ID_COLUMN, visibleFrom: 'md' },
  { ...PHONE_COLUMN, visibleFrom: 'lg' },
  { header: 'Cadastro', visibleFrom: 'xl', cell: (person) => formatDate(person.createdAt) },
];

const PRODUCER_COLUMNS: DataTableColumn<Person>[] = [
  { header: 'Potencial', visibleFrom: 'sm', cell: (person) => person.producer?.potential.name ?? '—' },
  { header: 'Cultura', visibleFrom: 'md', cell: (person) => person.producer?.mainCrop ?? '—' },
  {
    header: 'Área (ha)',
    visibleFrom: 'md',
    cell: (person) =>
      person.producer?.totalArea == null ? '—' : formatDecimal(person.producer.totalArea),
  },
  { ...NATIONAL_ID_COLUMN, visibleFrom: 'lg' },
  { ...PHONE_COLUMN, visibleFrom: 'xl' },
];

const EMPLOYEE_COLUMNS: DataTableColumn<Person>[] = [
  {
    header: 'Situação',
    visibleFrom: 'sm',
    cell: (person) => (person.employee ? getEmployeeStatus(person.employee) : '—'),
  },
  {
    header: 'Admissão',
    visibleFrom: 'md',
    cell: (person) => (person.employee?.hiredAt ? formatDate(person.employee.hiredAt) : '—'),
  },
  {
    header: 'Membro da equipe',
    visibleFrom: 'lg',
    cell: (person) => person.employee?.member?.name ?? '—',
  },
  { ...PHONE_COLUMN, visibleFrom: 'xl' },
];

const TYPE_COLUMNS: Record<PersonType, DataTableColumn<Person>[]> = {
  employee: EMPLOYEE_COLUMNS,
  producer: PRODUCER_COLUMNS,
};

const TYPE_READ_PERMISSIONS: Record<PersonType, string> = {
  employee: 'employees.read',
  producer: 'producers.read',
};

function getColumns(type: string | undefined, permissions: string[]): DataTableColumn<Person>[] {
  const isPersonType = type === 'employee' || type === 'producer';

  return isPersonType && permissions.includes(TYPE_READ_PERMISSIONS[type])
    ? TYPE_COLUMNS[type]
    : PERSON_COLUMNS;
}

type PersonsListPageProps = {
  section: PersonSection;
  searchParams: Promise<SearchParams>;
};

export async function PersonsListPage({ section, searchParams }: PersonsListPageProps) {
  const session = await requireSession(section.readPermissions);
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, section.filters);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: normalizeDocumentSearch(searchTerm) },
    { ...toApiFilters(filters, section.filters), ...(section.type && { type: section.type }) },
  );

  const persons = await apiRequest<Paginated<Person>>(`/persons?${query}`, {
    token: session.accessToken,
  });

  if (persons.meta.totalPages > 0 && page > persons.meta.totalPages) {
    redirect(buildListHref(section.href, listQuery, persons.meta.totalPages, pageSize));
  }

  const creatableTypes = getCreatablePersonTypes(session.permissions);
  const canCreate =
    hasPermission(session, 'persons.create') &&
    (section.type ? creatableTypes.includes(section.type) : creatableTypes.length > 0);
  const createAction = canCreate && (
    <Button href={`${section.href}/new`}>
      <UserPlus />
      {section.createLabel}
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={section.icon}
        title={section.title}
        description={section.description}
        actions={createAction}
        searchPlaceholder='Buscar por nome ou CPF/CNPJ'
        filters={<ListFilters filters={section.filters} values={filters} />}
      />

      <DataTable
        rows={persons.data}
        rowHref={(person) => `${section.href}/${person.id}`}
        primary={{
          header: section.recordTitle,
          title: (person) => person.name,
          subtitle: (person) => person.email ?? 'E-mail não informado',
          avatar: true,
        }}
        columns={getColumns(section.type ?? filters.type, session.permissions)}
        actions={{
          canUpdate: hasPermission(session, 'persons.update'),
          deleteDialog: (person) =>
            canDeletePerson(session.permissions, person.types)
              ? {
                  ...getPersonDeleteTexts(person.types),
                  recordName: person.name,
                  deletePath: `/persons/${person.id}`,
                }
              : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={section.icon}
            pathname={section.href}
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={section.emptyTexts}
          />
        }
        footer={<ListPagination pathname={section.href} query={listQuery} meta={persons.meta} />}
      />
    </div>
  );
}
