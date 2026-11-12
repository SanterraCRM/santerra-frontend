import { notFound } from 'next/navigation';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest } from '@/lib/api';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Member } from '@/types/member';
import type { Potential } from '@/types/potential';

import PersonForm from './person-form';
import { getCreatablePersonTypes } from './person-types';
import type { PersonSection } from './persons-config';

type NewPersonPageProps = {
  section: PersonSection;
};

export async function NewPersonPage({ section }: NewPersonPageProps) {
  const session = await requireSession('persons.create');
  const personTypes = getCreatablePersonTypes(session.permissions).filter(
    (type) => !section.type || type === section.type,
  );

  if (personTypes.length === 0) {
    notFound();
  }

  const [potentials, members] = await Promise.all([
    personTypes.includes('producer')
      ? apiRequest<Paginated<Potential>>('/potentials?limit=100', { token: session.accessToken })
      : null,
    personTypes.includes('employee') && hasPermission(session, 'members.read')
      ? apiRequest<Paginated<Member>>('/members?limit=100', { token: session.accessToken })
      : null,
  ]);

  return (
    <RecordPageLayout
      backHref={section.href}
      backLabel={section.title}
      icon={section.icon}
      title={section.newTitle}
      description={section.newDescription}
    >
      <PersonForm
        listHref={section.href}
        personTypes={personTypes}
        fixedType={section.type}
        potentials={potentials?.data.map(({ id, name }) => ({ id, name })) ?? []}
        members={members?.data.map(({ id, name, email }) => ({ id, name, email }))}
        canCreatePotential={hasPermission(session, 'potentials.create')}
      />
    </RecordPageLayout>
  );
}
