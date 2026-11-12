import type { Metadata } from 'next';

import { generatePersonMetadata, PersonRecordPage } from '../../persons/person-record-page';
import { PERSON_SECTIONS } from '../../persons/persons-config';

type EmployeePageProps = {
  params: Promise<{ id: string }>;
};

export function generateMetadata({ params }: EmployeePageProps): Promise<Metadata> {
  return generatePersonMetadata(PERSON_SECTIONS.employees, params);
}

export default function EmployeePage({ params }: EmployeePageProps) {
  return <PersonRecordPage section={PERSON_SECTIONS.employees} params={params} />;
}
