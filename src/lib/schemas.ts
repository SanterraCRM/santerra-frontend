import { z } from 'zod';

import { onlyDigits, parseDecimal, parseMoney, toDayBoundary } from './format';
import { MIN_PASSWORD_LENGTH } from './password';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail')
  .pipe(z.email('Informe um e-mail válido'));

function digitsOrNull(value: string): string | null {
  return onlyDigits(value) || null;
}

export const optionalNationalIdSchema = z
  .string()
  .refine(
    (value) => [0, 11, 14].includes(onlyDigits(value).length),
    'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)',
  )
  .transform(digitsOrNull);

export const optionalCnpjSchema = z
  .string()
  .refine((value) => [0, 14].includes(onlyDigits(value).length), 'Informe o CNPJ com 14 dígitos')
  .transform(digitsOrNull);

export const optionalPhoneSchema = z
  .string()
  .refine((value) => [0, 10, 11].includes(onlyDigits(value).length), 'Informe o telefone com DDD')
  .transform(digitsOrNull);

export const optionalEmailSchema = z
  .string()
  .trim()
  .refine((value) => !value || z.email().safeParse(value).success, 'Informe um e-mail válido')
  .transform((value) => value || null);

export const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

export const optionalDecimalSchema = z.string().transform(parseDecimal);

export const optionalMoneySchema = z.string().transform(parseMoney);

export const comboboxOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export function requiredOptionSchema(message: string) {
  return comboboxOptionSchema
    .nullable()
    .refine((option) => option !== null, message)
    .transform((option) => option?.value ?? '');
}

export const optionIdsSchema = z
  .array(comboboxOptionSchema)
  .transform((options) => options.map((option) => option.value));

export const storedFilesSchema = z.array(
  z.object({
    id: z.string(),
    originalName: z.string().nullable(),
    mimeType: z.string(),
    size: z.number(),
  }),
);

export const optionalDateSchema = z
  .string()
  .transform((value) => (value ? toDayBoundary(value, 'start') : null));

export function createPasswordConfirmationSchema(confirmationMessage: string) {
  return z
    .object({
      password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`),
      passwordConfirmation: z.string().min(1, confirmationMessage),
    })
    .refine((values) => values.password === values.passwordConfirmation, {
      message: 'As senhas não conferem',
      path: ['passwordConfirmation'],
    });
}
