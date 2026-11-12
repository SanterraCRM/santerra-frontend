import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Producer, ProducerInput } from '@/types/producer';

export function useUpdateProducer() {
  const { data: session } = useSession();

  return useMutation((id: string, input: ProducerInput) =>
    apiRequest<Producer>(`/producers/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
