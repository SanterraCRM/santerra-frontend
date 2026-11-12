import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
const SEARCH_LIMIT = '20';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useComboboxSearch(sourceKey: ComboboxSourceKey, search: string, enabled: boolean) {
  const { data: session } = useSession();
  const term = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const source = getComboboxSource(sourceKey);

  return useQuery({
    queryKey: ['combobox', sourceKey, term],
    queryFn: async ({ signal }): Promise<ComboboxOption[]> => {
      const params = new URLSearchParams({ limit: SEARCH_LIMIT, ...source.params });

      if (term) {
        params.set('search', source.normalizeSearch?.(term) ?? term);
      }

      const page = await apiRequest<Paginated<unknown>>(`${source.path}?${params}`, {
        token: session?.accessToken,
        signal,
      });

      return page.data.map((item) => source.toOption(item));
    },
    enabled: enabled && Boolean(session?.accessToken),
    placeholderData: keepPreviousData,
  });
}
