import type { ReactNode } from 'react';

import { apiRequest } from './api';
import { formatCurrency, formatNationalId, normalizeDocumentSearch } from './format';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME_ORDER = { sort: 'name' };

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  data?: Record<string, unknown>;
};

type ComboboxSource<T> = {
  path: string;
  params?: Record<string, string>;
  normalizeSearch?: (term: string) => string;
  toOption(item: T): ComboboxOption;
};

type PersonRecord = {
  id: string;
  person: { name: string; nationalId: string | null };
};

type ProductRecord = {
  id: string;
  name: string;
  manufacturer: { name: string };
};

type BusinessRecord = {
  id: string;
  name: string;
  registrationNumber: string | null;
};

type NamedRecord = {
  id: string;
  name: string;
};

type MemberRecord = {
  id: string;
  name: string;
  email: string;
};

type WalletRecord = {
  id: string;
  value: number;
  member: { name: string };
};

function personToOption({ id, person }: PersonRecord): ComboboxOption {
  return {
    value: id,
    label: person.name,
    description: person.nationalId ? formatNationalId(person.nationalId) : undefined,
  };
}

function businessToOption({ id, name, registrationNumber }: BusinessRecord): ComboboxOption {
  return {
    value: id,
    label: name,
    description: registrationNumber ? formatNationalId(registrationNumber) : undefined,
  };
}

function memberToOption({ id, name, email }: MemberRecord): ComboboxOption {
  return { value: id, label: name, description: email };
}

export function getWalletBalance(option: ComboboxOption | null): number | null {
  const balance = option?.data?.balance;

  return typeof balance === 'number' ? balance : null;
}

export const COMBOBOX_SOURCES = {
  producers: {
    path: '/producers',
    normalizeSearch: normalizeDocumentSearch,
    toOption: personToOption,
  } satisfies ComboboxSource<PersonRecord>,
  employees: {
    path: '/employees',
    normalizeSearch: normalizeDocumentSearch,
    toOption: personToOption,
  } satisfies ComboboxSource<PersonRecord>,
  activeEmployees: {
    path: '/employees',
    params: { active: 'true' },
    normalizeSearch: normalizeDocumentSearch,
    toOption: personToOption,
  } satisfies ComboboxSource<PersonRecord>,
  products: {
    path: '/products',
    toOption: ({ id, name, manufacturer }: ProductRecord) => ({
      value: id,
      label: name,
      description: manufacturer.name,
    }),
  } satisfies ComboboxSource<ProductRecord>,
  resellers: {
    path: '/resellers',
    normalizeSearch: normalizeDocumentSearch,
    toOption: businessToOption,
  } satisfies ComboboxSource<BusinessRecord>,
  manufacturers: {
    path: '/manufacturers',
    params: NAME_ORDER,
    normalizeSearch: normalizeDocumentSearch,
    toOption: businessToOption,
  } satisfies ComboboxSource<BusinessRecord>,
  events: {
    path: '/events',
    params: NAME_ORDER,
    toOption: ({ id, name }: NamedRecord) => ({ value: id, label: name }),
  } satisfies ComboboxSource<NamedRecord>,
  wallets: {
    path: '/wallets',
    params: NAME_ORDER,
    toOption: ({ id, value, member }: WalletRecord) => ({
      value: id,
      label: member.name,
      description: `Saldo de ${formatCurrency(value)}`,
      data: { balance: value },
    }),
  } satisfies ComboboxSource<WalletRecord>,
  members: {
    path: '/members',
    params: NAME_ORDER,
    toOption: memberToOption,
  } satisfies ComboboxSource<MemberRecord>,
  membersWithoutWallet: {
    path: '/members',
    params: { ...NAME_ORDER, active: 'true', hasWallet: 'false' },
    toOption: memberToOption,
  } satisfies ComboboxSource<MemberRecord>,
};

export type ComboboxSourceKey = keyof typeof COMBOBOX_SOURCES;

export function getComboboxSource(key: ComboboxSourceKey): ComboboxSource<unknown> {
  return COMBOBOX_SOURCES[key] as ComboboxSource<unknown>;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export async function resolveComboboxOption(
  key: ComboboxSourceKey,
  id: string,
  token: string,
): Promise<ComboboxOption | null> {
  if (!isUuid(id)) {
    return null;
  }

  const source = getComboboxSource(key);

  return apiRequest<unknown>(`${source.path}/${id}`, { token })
    .then((item) => source.toOption(item))
    .catch(() => null);
}
