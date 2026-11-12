import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Potential, PotentialInput } from '@/types/potential';

export function useUpdatePotential() {
  const { data: session } = useSession();

  return useMutation((id: string, input: PotentialInput) =>
    apiRequest<Potential>(`/potentials/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
