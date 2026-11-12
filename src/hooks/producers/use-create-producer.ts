import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Producer, ProducerInput } from '@/types/producer';

export function useCreateProducer() {
  const { data: session } = useSession();

  return useMutation((personId: string, input: ProducerInput) =>
    apiRequest<Producer>('/producers', {
      method: 'POST',
      body: { personId, ...input },
      token: session?.accessToken,
    }),
  );
}
