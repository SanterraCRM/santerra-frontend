import type { ReactNode } from 'react';

import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ActionCardProps = {
  title: string;
  description: string;
  action: ReactNode;
};

export function ActionCard({ title, description, action }: ActionCardProps) {
  return (
    <Card className='animate-fade-up [animation-delay:80ms]'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className='sm:self-center'>{action}</CardAction>
      </CardHeader>
    </Card>
  );
}
