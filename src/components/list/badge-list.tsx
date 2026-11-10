import { Badge } from '@/components/ui/badge';

type BadgeListProps = {
  labels: string[];
};

export function BadgeList({ labels }: BadgeListProps) {
  if (labels.length === 0) {
    return '—';
  }

  return (
    <span className='flex flex-wrap gap-1'>
      {labels.map((label) => (
        <Badge
          key={label}
          variant='outline'
          className='border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300'
        >
          {label}
        </Badge>
      ))}
    </span>
  );
}
