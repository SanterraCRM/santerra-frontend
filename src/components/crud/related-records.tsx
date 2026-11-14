import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { RecordList, type RelatedRecord } from './record-list';

export type { RelatedRecord } from './record-list';

type RelatedRecordsProps = {
  title: string;
  description?: string;
  records: RelatedRecord[];
  total: number;
  emptyMessage: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function RelatedRecords({
  title,
  description,
  records,
  total,
  emptyMessage,
  viewAllHref,
  viewAllLabel = 'Ver todos',
}: RelatedRecordsProps) {
  return (
    <Card className='animate-fade-up [animation-delay:120ms]'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {viewAllHref && total > 0 && (
          <CardAction>
            <Button href={viewAllHref} variant='outline' size='sm'>
              {viewAllLabel} ({total})
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <RecordList records={records} emptyMessage={emptyMessage} />
      </CardContent>
    </Card>
  );
}
