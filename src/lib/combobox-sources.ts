import { apiRequest } from './api';
import { formatNationalId, normalizeDocumentSearch } from './format';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
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

type ResellerRecord = {
  id: string;
  name: string;
  registrationNumber: string | null;
};

function personToOption({ id, person }: PersonRecord): ComboboxOption {
  return {
    value: id,
    label: person.name,
    description: person.nationalId ? formatNationalId(person.nationalId) : undefined,
  };
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
    toOption: ({ id, name, registrationNumber }: ResellerRecord) => ({
      value: id,
      label: name,
      description: registrationNumber ? formatNationalId(registrationNumber) : undefined,
    }),
  } satisfies ComboboxSource<ResellerRecord>,
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
