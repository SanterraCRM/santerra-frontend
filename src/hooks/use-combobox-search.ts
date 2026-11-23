import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { apiRequest } from '@/lib/api';
import {
  type ComboboxOption,
  type ComboboxSourceKey,
  getComboboxSource,
} from '@/lib/combobox-sources';
import type { Paginated } from '@/types/api';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = '20';

type ComboboxSearchPage = {
  options: ComboboxOption[];
  page: number;
  totalPages: number;
  total: number;
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function uniqueOptions(options: ComboboxOption[]): ComboboxOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (seen.has(option.value)) {
      return false;
    }

    seen.add(option.value);
    return true;
  });
}

export function useComboboxSearch(sourceKey: ComboboxSourceKey, search: string, enabled: boolean) {
  const { data: session } = useSession();
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const source = getComboboxSource(sourceKey);
  const query = useInfiniteQuery({
    queryKey: ['combobox', sourceKey, term],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }): Promise<ComboboxSearchPage> => {
      const params = new URLSearchParams({
        ...source.params,
        limit: PAGE_SIZE,
        page: String(pageParam),
      });

      if (term) {
        params.set('search', source.normalizeSearch?.(term) ?? term);
      }

      const { data, meta } = await apiRequest<Paginated<unknown>>(`${source.path}?${params}`, {
        token: session?.accessToken,
        signal,
      });

      return {
        options: data.map((item) => source.toOption(item)),
        page: meta.page,
        totalPages: meta.totalPages,
        total: meta.total,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && Boolean(session?.accessToken),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    options: uniqueOptions(query.data?.pages.flatMap((page) => page.options) ?? []),
    total: query.data?.pages[0]?.total ?? 0,
  };
}
