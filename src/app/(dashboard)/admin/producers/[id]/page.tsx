import type { Metadata } from 'next';

import { generatePersonMetadata, PersonRecordPage } from '../../persons/person-record-page';
import { PERSON_SECTIONS } from '../../persons/persons-config';

type ProducerPageProps = {
  params: Promise<{ id: string }>;
};

export function generateMetadata({ params }: ProducerPageProps): Promise<Metadata> {
  return generatePersonMetadata(PERSON_SECTIONS.producers, params);
}

export default function ProducerPage({ params }: ProducerPageProps) {
  return <PersonRecordPage section={PERSON_SECTIONS.producers} params={params} />;
}
