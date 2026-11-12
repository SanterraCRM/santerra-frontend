'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId, useOptimistic, useTransition } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, toHref } from '@/lib/list-params';

type ListPageSizeProps = {
  value: number;
};

export function ListPageSize({ value }: ListPageSizeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const labelId = useId();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const [, startTransition] = useTransition();

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams);

    if (Number(nextValue) === DEFAULT_PAGE_SIZE) {
      params.delete('limit');
    } else {
      params.set('limit', nextValue);
    }

    params.delete('page');
    startTransition(() => {
      setOptimisticValue(Number(nextValue));
      router.push(toHref(pathname, params));
    });
  }

  return (
    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
      <span id={labelId}>Por página</span>
      <Select value={String(optimisticValue)} onValueChange={handleChange}>
        <SelectTrigger size='sm' aria-labelledby={labelId} className='bg-card text-foreground'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
