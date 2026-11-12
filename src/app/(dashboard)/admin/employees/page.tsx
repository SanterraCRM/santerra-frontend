import type { Metadata } from 'next';

import type { SearchParams } from '@/lib/list-params';

import { PERSON_SECTIONS } from '../persons/persons-config';
import { PersonsListPage } from '../persons/persons-list-page';

export const metadata: Metadata = {
  title: PERSON_SECTIONS.employees.title,
};

type EmployeesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default function EmployeesPage({ searchParams }: EmployeesPageProps) {
  return <PersonsListPage section={PERSON_SECTIONS.employees} searchParams={searchParams} />;
}
