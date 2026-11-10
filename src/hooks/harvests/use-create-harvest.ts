import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Harvest, HarvestInput } from '@/types/harvest';

export function useCreateHarvest() {
  const { data: session } = useSession();

  return useMutation((input: HarvestInput) =>
    apiRequest<Harvest>('/harvests', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
