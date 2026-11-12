import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Potential, PotentialInput } from '@/types/potential';

export function useCreatePotential() {
  const { data: session } = useSession();

  return useMutation((input: PotentialInput) =>
    apiRequest<Potential>('/potentials', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
