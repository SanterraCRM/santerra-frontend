import { cn } from '@/lib/cn';

type ProgressMeterProps = {
  value: number;
  max: number;
  label?: string;
  valueText?: string;
  className?: string;
};

const FILL_MIN_WIDTH = '4px';

export function ProgressMeter({ value, max, label, valueText, className }: ProgressMeterProps) {
  const share = max > 0 ? Math.min(value / max, 1) * 100 : 0;

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      {(label || valueText) && (
        <span className='flex items-baseline justify-between gap-3 text-sm'>
          <span className='min-w-0 truncate text-foreground'>{label}</span>
          {valueText && (
            <span className='shrink-0 font-medium text-foreground tabular-nums'>{valueText}</span>
          )}
        </span>
      )}
      <span
        aria-hidden='true'
        className='block h-2 overflow-hidden rounded-r-[4px] bg-brand-100 dark:bg-brand-950'
      >
        <span
          className='block h-full rounded-r-[4px] bg-primary'
          style={{ width: value > 0 ? `max(${share}%, ${FILL_MIN_WIDTH})` : 0 }}
        />
      </span>
    </div>
  );
}
