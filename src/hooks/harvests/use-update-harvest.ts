import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Harvest, HarvestInput } from '@/types/harvest';

export function useUpdateHarvest() {
  const { data: session } = useSession();

  return useMutation((id: string, input: HarvestInput) =>
    apiRequest<Harvest>(`/harvests/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
