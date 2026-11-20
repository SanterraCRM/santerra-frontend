import type { Session } from 'next-auth';

import { apiRequest } from '@/lib/api';
import type { PogPocFilterOptions } from '@/types/pog-poc';

const EMPTY_FILTER_OPTIONS: PogPocFilterOptions = { regioes: [] };

export function getPogPocFilterOptions(session: Session): Promise<PogPocFilterOptions> {
  return apiRequest<PogPocFilterOptions>('/pog-poc/filter-options', {
    token: session.accessToken,
  }).catch(() => EMPTY_FILTER_OPTIONS);
}
