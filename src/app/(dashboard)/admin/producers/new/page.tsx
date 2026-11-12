import type { Metadata } from 'next';

import { NewPersonPage } from '../../persons/new-person-page';
import { PERSON_SECTIONS } from '../../persons/persons-config';

export const metadata: Metadata = {
  title: PERSON_SECTIONS.producers.newTitle,
};

export default function NewProducerRoute() {
  return <NewPersonPage section={PERSON_SECTIONS.producers} />;
}
