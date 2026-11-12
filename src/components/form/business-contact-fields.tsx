'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { maskCnpj, maskPhone } from '@/lib/format';
import { optionalCnpjSchema, optionalEmailSchema, optionalPhoneSchema } from '@/lib/schemas';

import { FormInput } from './form-input';

export function createBusinessContactSchema(nameMessage: string) {
  return z.object({
    name: z.string().trim().min(1, nameMessage),
    registrationNumber: optionalCnpjSchema,
    phoneNumber: optionalPhoneSchema,
    email: optionalEmailSchema,
  });
}

export type BusinessContactInput = {
  name: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
};

type BusinessContactRecord = {
  name: string;
  registrationNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
};

export function toBusinessContactValues(record?: BusinessContactRecord): BusinessContactInput {
  return {
    name: record?.name ?? '',
    registrationNumber: record?.registrationNumber ? maskCnpj(record.registrationNumber) : '',
    phoneNumber: record?.phoneNumber ? maskPhone(record.phoneNumber) : '',
    email: record?.email ?? '',
  };
}

type BusinessContactFieldsProps = {
  emailPlaceholder: string;
};

export function BusinessContactFields({ emailPlaceholder }: BusinessContactFieldsProps) {
  const { control } = useFormContext<BusinessContactInput>();

  return (
    <div className='grid gap-5 sm:grid-cols-2'>
      <FormInput
        control={control}
        name='name'
        label='Nome'
        required
        autoComplete='organization'
        placeholder='Razão social ou nome fantasia'
        className='sm:col-span-2'
      />
      <FormInput
        control={control}
        name='registrationNumber'
        label='CNPJ'
        inputMode='numeric'
        placeholder='00.000.000/0000-00'
        mask={maskCnpj}
      />
      <FormInput
        control={control}
        name='phoneNumber'
        label='Telefone'
        type='tel'
        autoComplete='tel-national'
        placeholder='(00) 00000-0000'
        mask={maskPhone}
      />
      <FormInput
        control={control}
        name='email'
        label='E-mail'
        type='email'
        autoComplete='email'
        placeholder={emailPlaceholder}
        className='sm:col-span-2'
      />
    </div>
  );
}
