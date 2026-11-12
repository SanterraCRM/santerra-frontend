import type { Metadata } from 'next';

import type { SearchParams } from '@/lib/list-params';

import { PERSON_SECTIONS } from '../persons/persons-config';
import { PersonsListPage } from '../persons/persons-list-page';

export const metadata: Metadata = {
  title: PERSON_SECTIONS.producers.title,
};

type ProducersPageProps = {
  searchParams: Promise<SearchParams>;
};

export default function ProducersPage({ searchParams }: ProducersPageProps) {
  return <PersonsListPage section={PERSON_SECTIONS.producers} searchParams={searchParams} />;
}
