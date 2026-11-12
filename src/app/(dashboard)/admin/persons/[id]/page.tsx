import type { Metadata } from 'next';

import { generatePersonMetadata, PersonRecordPage } from '../person-record-page';
import { PERSON_SECTIONS } from '../persons-config';

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

export function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  return generatePersonMetadata(PERSON_SECTIONS.persons, params);
}

export default function PersonPage({ params }: PersonPageProps) {
  return <PersonRecordPage section={PERSON_SECTIONS.persons} params={params} />;
}
