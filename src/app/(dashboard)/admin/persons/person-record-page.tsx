import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Fragment, type ReactNode } from 'react';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RelatedRecords } from '@/components/crud/related-records';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest, getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate, formatDecimal, formatNationalId, formatPhone } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { CommercialTrip } from '@/types/commercial-trip';
import type { Member } from '@/types/member';
import type { Person } from '@/types/person';
import type { Potential } from '@/types/potential';

import { COMMERCIAL_TRIPS_HREF, toTripRecords } from '../commercial-trips/commercial-trips-config';

import EmployeeForm from './employee-form';
import PersonForm from './person-form';
import { canDeletePerson } from './person-types';
import {
  EMPLOYEE_UNLINK_TEXTS,
  formatPersonTypes,
  getEmployeeStatus,
  getPersonDeleteTexts,
  type PersonSection,
  PRODUCER_UNLINK_TEXTS,
} from './persons-config';
import ProducerForm from './producer-form';

const RELATED_TRIPS_LIMIT = 5;

type PersonRecordParams = Promise<{ id: string }>;

function getPerson(id: string, token: string): Promise<Person> {
  return getRecordOrNotFound<Person>(`/persons/${id}`, token);
}

export async function generatePersonMetadata(
  section: PersonSection,
  params: PersonRecordParams,
): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !section.readPermissions.every((permission) => hasPermission(session, permission))) {
    return { title: section.recordTitle };
  }

  const { id } = await params;
  const person = await getPerson(id, session.accessToken);

  return { title: person.name };
}

type PersonRecordPageProps = {
  section: PersonSection;
  params: PersonRecordParams;
};

export async function PersonRecordPage({ section, params }: PersonRecordPageProps) {
  const session = await requireSession(section.readPermissions);
  const { id } = await params;
  const person = await getPerson(id, session.accessToken);

  if (section.type && !person.types.includes(section.type)) {
    notFound();
  }

  const { employee, producer } = person;
  const listHref = section.href;
  const can = (permission: string) => hasPermission(session, permission);
  const isEmployee = person.types.includes('employee');
  const isProducer = person.types.includes('producer');
  const canEditEmployee = employee ? can('employees.update') : !isEmployee && can('employees.create');
  const canEditProducer =
    can('potentials.read') &&
    (producer ? can('producers.update') : !isProducer && can('producers.create'));

  const canReadTrips = can('commercial-trips.read');
  const [potentials, members, producerTrips, employeeTrips] = await Promise.all([
    canEditProducer
      ? apiRequest<Paginated<Potential>>('/potentials?limit=100', { token: session.accessToken })
      : null,
    canEditEmployee && can('members.read')
      ? apiRequest<Paginated<Member>>('/members?limit=100', { token: session.accessToken })
      : null,
    canReadTrips && producer
      ? apiRequest<Paginated<CommercialTrip>>(
          `/commercial-trips?producerId=${producer.id}&limit=${RELATED_TRIPS_LIMIT}`,
          { token: session.accessToken },
        )
      : null,
    canReadTrips && employee
      ? apiRequest<Paginated<CommercialTrip>>(
          `/commercial-trips?responsibleId=${employee.id}&limit=${RELATED_TRIPS_LIMIT}`,
          { token: session.accessToken },
        )
      : null,
  ]);
  const potentialOptions = potentials?.data.map(({ id: value, name }) => ({ id: value, name })) ?? [];
  const memberOptions = members?.data.map(({ id: value, name, email }) => ({ id: value, name, email }));

  const typeLabel = formatPersonTypes(person.types);
  const createdAt = `Cadastro criado em ${formatDate(person.createdAt, 'long')}`;

  function renderEmployeeSection(): ReactNode {
    if (!employee) {
      return (
        !isEmployee &&
        canEditEmployee && (
          <EmployeeForm personId={person.id} members={memberOptions} listHref={listHref} />
        )
      );
    }

    const unlinkAction = can('employees.delete') && (
      <DeleteRecordButton
        {...EMPLOYEE_UNLINK_TEXTS}
        recordName={person.name}
        deletePath={`/employees/${employee.id}`}
        listHref={listHref}
        label='Remover vínculo'
        size='sm'
      />
    );

    if (canEditEmployee) {
      return (
        <EmployeeForm
          personId={person.id}
          employee={employee}
          members={memberOptions}
          listHref={listHref}
          action={unlinkAction}
        />
      );
    }

    return (
      <RecordDetails
        title='Dados de funcionário'
        action={unlinkAction}
        fields={[
          { label: 'Situação', value: getEmployeeStatus(employee) },
          { label: 'Data de admissão', value: employee.hiredAt && formatDate(employee.hiredAt) },
          {
            label: 'Data de desligamento',
            value: employee.terminatedAt && formatDate(employee.terminatedAt),
          },
          {
            label: 'Membro da equipe',
            value: employee.member && `${employee.member.name} (${employee.member.email})`,
          },
        ]}
      />
    );
  }

  function renderProducerSection(): ReactNode {
    if (!producer) {
      return (
        !isProducer &&
        canEditProducer && (
          <ProducerForm
            personId={person.id}
            potentials={potentialOptions}
            canCreatePotential={can('potentials.create')}
            listHref={listHref}
          />
        )
      );
    }

    const unlinkAction = can('producers.delete') && (
      <DeleteRecordButton
        {...PRODUCER_UNLINK_TEXTS}
        recordName={person.name}
        deletePath={`/producers/${producer.id}`}
        listHref={listHref}
        label='Remover vínculo'
        size='sm'
      />
    );

    if (canEditProducer) {
      return (
        <ProducerForm
          personId={person.id}
          producer={producer}
          potentials={potentialOptions}
          canCreatePotential={can('potentials.create')}
          listHref={listHref}
          action={unlinkAction}
        />
      );
    }

    return (
      <RecordDetails
        title='Dados de produtor'
        action={unlinkAction}
        fields={[
          { label: 'Potencial', value: producer.potential.name },
          { label: 'Cultura principal', value: producer.mainCrop },
          {
            label: 'Área total (ha)',
            value: producer.totalArea === null ? null : formatDecimal(producer.totalArea),
          },
          { label: 'Endereço', value: producer.address, wide: true },
        ]}
      />
    );
  }

  const linkSections = [
    { key: 'employee', isLinked: isEmployee, content: renderEmployeeSection() },
    { key: 'producer', isLinked: isProducer, content: renderProducerSection() },
  ].sort((first, second) => Number(second.isLinked) - Number(first.isLinked));

  return (
    <RecordPageLayout
      backHref={listHref}
      backLabel={section.title}
      icon={section.icon}
      title={person.name}
      description={typeLabel ? `${typeLabel} · ${createdAt}` : createdAt}
      actions={
        canDeletePerson(session.permissions, person.types) && (
          <DeleteRecordButton
            {...getPersonDeleteTexts(person.types)}
            recordName={person.name}
            deletePath={`/persons/${person.id}`}
            listHref={listHref}
          />
        )
      }
    >
      {can('persons.update') ? (
        <PersonForm person={person} listHref={listHref} />
      ) : (
        <RecordDetails
          title='Dados da pessoa'
          fields={[
            { label: 'Nome', value: person.name, wide: true },
            { label: 'CPF ou CNPJ', value: person.nationalId && formatNationalId(person.nationalId) },
            { label: 'Telefone', value: person.phoneNumber && formatPhone(person.phoneNumber) },
            { label: 'E-mail', value: person.email, wide: true },
          ]}
        />
      )}

      {linkSections.map(({ key, content }) => (
        <Fragment key={key}>{content}</Fragment>
      ))}

      {producer && producerTrips && (
        <RelatedRecords
          title='Visitas ao produtor'
          description='As visitas mais recentes a este produtor.'
          records={toTripRecords(producerTrips.data, 'producer')}
          total={producerTrips.meta.total}
          emptyMessage='Nenhuma visita a este produtor.'
          viewAllHref={`${COMMERCIAL_TRIPS_HREF}?producerId=${producer.id}`}
          viewAllLabel='Ver todas'
        />
      )}

      {employee && employeeTrips && (
        <RelatedRecords
          title='Visitas sob responsabilidade'
          description='As visitas mais recentes em que este funcionário é o responsável.'
          records={toTripRecords(employeeTrips.data, 'responsible')}
          total={employeeTrips.meta.total}
          emptyMessage='Nenhuma visita sob a responsabilidade deste funcionário.'
          viewAllHref={`${COMMERCIAL_TRIPS_HREF}?responsibleId=${employee.id}`}
          viewAllLabel='Ver todas'
        />
      )}
    </RecordPageLayout>
  );
}
