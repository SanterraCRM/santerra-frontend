import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { CommercialAction, CommercialActionInput } from '@/types/commercial-action';

export function useUpdateCommercialAction() {
  const { data: session } = useSession();

  return useMutation((id: string, input: CommercialActionInput) =>
    apiRequest<CommercialAction>(`/commercial-actions/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
