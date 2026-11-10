import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export type StatusTone = 'success' | 'neutral' | 'info' | 'warning';

const TONE_CLASSES: Record<StatusTone, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
};

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <Badge variant='outline' className={cn(TONE_CLASSES[tone])}>
      {label}
    </Badge>
  );
}
