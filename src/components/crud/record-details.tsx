import type { ReactNode } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/cn';

type RecordDetailsField = {
  label: string;
  value?: ReactNode;
  wide?: boolean;
};

type RecordDetailsProps = {
  title: string;
  fields: RecordDetailsField[];
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function RecordDetails({
  title,
  fields,
  description = 'Você tem permissão apenas para visualizar este cadastro.',
  action,
  children,
}: RecordDetailsProps) {
  return (
    <Card className='animate-fade-up [animation-delay:80ms]'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <dl className='grid gap-5 sm:grid-cols-2'>
          {fields.map(({ label, value, wide }) => (
            <div key={label} className={cn('flex min-w-0 flex-col gap-1', wide && 'sm:col-span-2')}>
              <dt className='text-sm text-muted-foreground'>{label}</dt>
              <dd
                className={cn(
                  'text-sm font-medium wrap-break-word text-foreground',
                  !value && 'font-normal text-muted-foreground',
                )}
              >
                {value || 'Não informado'}
              </dd>
            </div>
          ))}
        </dl>
        {children}
      </CardContent>
    </Card>
  );
}
