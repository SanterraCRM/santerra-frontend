import type { EmployeeInput } from './employee';
import type { ProducerInput } from './producer';

export type PersonType = 'employee' | 'producer';

export type PersonEmployee = {
  id: string;
  hiredAt: string | null;
  terminatedAt: string | null;
  member: { id: string; name: string; email: string } | null;
};

export type PersonProducer = {
  id: string;
  potential: { id: string; name: string };
  address: string | null;
  mainCrop: string | null;
  totalArea: number | null;
};

export type Person = {
  id: string;
  name: string;
  nationalId: string | null;
  phoneNumber: string | null;
  email: string | null;
  types: PersonType[];
  employee: PersonEmployee | null;
  producer: PersonProducer | null;
  createdAt: string;
  updatedAt: string;
};

export type PersonInput = Pick<Person, 'name' | 'nationalId' | 'phoneNumber' | 'email'>;

export type CreatePersonInput = PersonInput & {
  employee?: Omit<EmployeeInput, 'terminatedAt'>;
  producer?: ProducerInput;
};
