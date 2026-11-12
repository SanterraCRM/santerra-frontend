'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toHref } from '@/lib/list-params';

const DEBOUNCE_IN_MS = 300;

type ListSearchProps = {
  placeholder: string;
};

export function ListSearch({ placeholder }: ListSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTerm = searchParams.get('search') ?? '';
  const [term, setTerm] = useState(urlTerm);
  const [pushedTerm, setPushedTerm] = useState(urlTerm);
  const [renderedUrlTerm, setRenderedUrlTerm] = useState(urlTerm);
  const [isPending, startTransition] = useTransition();

  if (urlTerm !== renderedUrlTerm) {
    setRenderedUrlTerm(urlTerm);

    if (urlTerm !== pushedTerm) {
      setTerm(urlTerm);
      setPushedTerm(urlTerm);
    }
  }

  useEffect(() => {
    const nextTerm = term.trim();

    if (nextTerm === urlTerm) {
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (nextTerm) {
        params.set('search', nextTerm);
      } else {
        params.delete('search');
      }

      params.delete('page');
      setPushedTerm(nextTerm);
      startTransition(() => router.replace(toHref(pathname, params)));
    }, DEBOUNCE_IN_MS);

    return () => clearTimeout(timeout);
  }, [term, urlTerm, searchParams, pathname, router]);

  return (
    <div className='relative min-w-0 flex-1'>
      <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='search'
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className='bg-card pr-9 pl-9'
      />
      {isPending && (
        <Spinner className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground' />
      )}
    </div>
  );
}
