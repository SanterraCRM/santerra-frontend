import type { Metadata } from 'next';

import type { SearchParams } from '@/lib/list-params';

import { PERSON_SECTIONS } from './persons-config';
import { PersonsListPage } from './persons-list-page';

export const metadata: Metadata = {
  title: PERSON_SECTIONS.persons.title,
};

type PersonsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default function PersonsPage({ searchParams }: PersonsPageProps) {
  return <PersonsListPage section={PERSON_SECTIONS.persons} searchParams={searchParams} />;
}
