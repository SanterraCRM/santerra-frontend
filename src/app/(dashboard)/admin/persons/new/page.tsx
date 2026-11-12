import type { Metadata } from 'next';

import { NewPersonPage } from '../new-person-page';
import { PERSON_SECTIONS } from '../persons-config';

export const metadata: Metadata = {
  title: PERSON_SECTIONS.persons.newTitle,
};

export default function NewPersonRoute() {
  return <NewPersonPage section={PERSON_SECTIONS.persons} />;
}
