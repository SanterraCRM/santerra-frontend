import { BriefcaseBusiness, type LucideIcon, Tractor, Users } from 'lucide-react';

import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';
import type { PersonEmployee, PersonType } from '@/types/person';

export const PERSON_TYPE_LABELS: Record<PersonType, string> = {
  employee: 'Funcionário',
  producer: 'Produtor',
};

const PERSON_DETAIL_FILTERS: FilterDefinition[] = [
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
  {
    type: 'checkboxes',
    key: 'missing',
    label: 'Dados faltando',
    options: [
      { value: 'nationalId', label: 'Sem CPF/CNPJ' },
      { value: 'phoneNumber', label: 'Sem telefone' },
      { value: 'email', label: 'Sem e-mail' },
    ],
  },
];

export const PERSON_FILTERS: FilterDefinition[] = [
  {
    type: 'select',
    key: 'type',
    label: 'Tipo',
    options: [
      { value: 'employee', label: 'Funcionários' },
      { value: 'producer', label: 'Produtores' },
    ],
  },
  ...PERSON_DETAIL_FILTERS,
];

export const PERSON_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma pessoa encontrada',
  filtersDescription: 'Nenhuma pessoa corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque pelo documento.',
  emptyTitle: 'Nenhuma pessoa cadastrada',
  emptyDescription: 'Cadastre a primeira pessoa para começar.',
  emptyReadOnlyDescription: 'Quando houver pessoas cadastradas, elas aparecerão aqui.',
};

export type PersonSection = {
  type?: PersonType;
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  recordTitle: string;
  newTitle: string;
  newDescription: string;
  createLabel: string;
  readPermissions: string[];
  filters: FilterDefinition[];
  emptyTexts: ListEmptyStateTexts;
};

export const PERSON_SECTIONS = {
  persons: {
    href: '/admin/persons',
    icon: Users,
    title: 'Pessoas',
    description: 'Consulte e gerencie as pessoas cadastradas na sua empresa.',
    recordTitle: 'Pessoa',
    newTitle: 'Nova pessoa',
    newDescription: 'Escolha o tipo e preencha os dados para cadastrar uma pessoa.',
    createLabel: 'Nova pessoa',
    readPermissions: ['persons.read'],
    filters: PERSON_FILTERS,
    emptyTexts: PERSON_EMPTY_TEXTS,
  },
  employees: {
    type: 'employee',
    href: '/admin/employees',
    icon: BriefcaseBusiness,
    title: 'Funcionários',
    description: 'Consulte e gerencie os funcionários da sua empresa.',
    recordTitle: 'Funcionário',
    newTitle: 'Novo funcionário',
    newDescription: 'Preencha os dados para cadastrar um funcionário.',
    createLabel: 'Novo funcionário',
    readPermissions: ['persons.read', 'employees.read'],
    filters: PERSON_DETAIL_FILTERS,
    emptyTexts: {
      notFoundTitle: 'Nenhum funcionário encontrado',
      filtersDescription: 'Nenhum funcionário corresponde aos filtros aplicados.',
      searchHint: 'Confira a grafia ou busque pelo documento.',
      emptyTitle: 'Nenhum funcionário cadastrado',
      emptyDescription: 'Cadastre o primeiro funcionário da equipe.',
      emptyReadOnlyDescription: 'Quando houver funcionários cadastrados, eles aparecerão aqui.',
    },
  },
  producers: {
    type: 'producer',
    href: '/admin/producers',
    icon: Tractor,
    title: 'Produtores',
    description: 'Consulte e gerencie os produtores atendidos pela sua empresa.',
    recordTitle: 'Produtor',
    newTitle: 'Novo produtor',
    newDescription: 'Preencha os dados para cadastrar um produtor.',
    createLabel: 'Novo produtor',
    readPermissions: ['persons.read', 'producers.read'],
    filters: PERSON_DETAIL_FILTERS,
    emptyTexts: {
      notFoundTitle: 'Nenhum produtor encontrado',
      filtersDescription: 'Nenhum produtor corresponde aos filtros aplicados.',
      searchHint: 'Confira a grafia ou busque pelo documento.',
      emptyTitle: 'Nenhum produtor cadastrado',
      emptyDescription: 'Cadastre o primeiro produtor atendido pela empresa.',
      emptyReadOnlyDescription: 'Quando houver produtores cadastrados, eles aparecerão aqui.',
    },
  },
} satisfies Record<string, PersonSection>;

export const PERSON_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'A pessoa sai da lista e não poderá mais ser usada nos cadastros. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir pessoa',
  successMessage: 'Pessoa excluída.',
  errorMessage: 'Não foi possível excluir a pessoa. Tente novamente.',
};

export const EMPLOYEE_UNLINK_TEXTS: DeleteDialogTexts = {
  title: 'Remover vínculo de funcionário?',
  description:
    'A pessoa continua cadastrada, mas deixa de ser funcionário da empresa. Esta ação não pode ser desfeita.',
  confirmLabel: 'Remover vínculo',
  successMessage: 'Vínculo de funcionário removido.',
  errorMessage: 'Não foi possível remover o vínculo. Tente novamente.',
};

export const PRODUCER_UNLINK_TEXTS: DeleteDialogTexts = {
  title: 'Remover vínculo de produtor?',
  description:
    'A pessoa continua cadastrada, mas deixa de ser produtor da empresa. Esta ação não pode ser desfeita.',
  confirmLabel: 'Remover vínculo',
  successMessage: 'Vínculo de produtor removido.',
  errorMessage: 'Não foi possível remover o vínculo. Tente novamente.',
};

export function formatPersonTypes(types: PersonType[]): string {
  return types
    .map((type, index) =>
      index === 0 ? PERSON_TYPE_LABELS[type] : PERSON_TYPE_LABELS[type].toLowerCase(),
    )
    .join(' e ');
}

export function getPersonDeleteTexts(types: PersonType[]): DeleteDialogTexts {
  if (types.length === 0) {
    return PERSON_DELETE_TEXTS;
  }

  const links = types.map((type) => PERSON_TYPE_LABELS[type].toLowerCase()).join(' e de ');

  return {
    ...PERSON_DELETE_TEXTS,
    description: `A pessoa sai da lista, junto com os dados de ${links}, e não poderá mais ser usada nos cadastros. Esta ação não pode ser desfeita.`,
  };
}

export function getEmployeeStatus(employee: PersonEmployee): string {
  const { terminatedAt } = employee;

  return terminatedAt && new Date(terminatedAt) <= new Date() ? 'Desligado' : 'Ativo';
}
