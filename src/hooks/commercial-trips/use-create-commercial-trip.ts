import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { CommercialTrip, CommercialTripInput } from '@/types/commercial-trip';

export function useCreateCommercialTrip() {
  const { data: session } = useSession();

  return useMutation((input: CommercialTripInput) =>
    apiRequest<CommercialTrip>('/commercial-trips', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
