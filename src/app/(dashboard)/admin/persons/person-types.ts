import type { PersonType } from '@/types/person';

const LINK_DELETE_PERMISSIONS: Record<PersonType, string> = {
  employee: 'employees.delete',
  producer: 'producers.delete',
};

export function getCreatablePersonTypes(permissions: string[]): PersonType[] {
  const types: PersonType[] = [];

  if (permissions.includes('employees.create')) {
    types.push('employee');
  }

  if (permissions.includes('producers.create') && permissions.includes('potentials.read')) {
    types.push('producer');
  }

  return types;
}

export function canDeletePerson(permissions: string[], types: PersonType[]): boolean {
  return (
    permissions.includes('persons.delete') &&
    types.every((type) => permissions.includes(LINK_DELETE_PERMISSIONS[type]))
  );
}
