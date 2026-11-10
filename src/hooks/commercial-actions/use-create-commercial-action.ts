import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { CommercialAction, CommercialActionInput } from '@/types/commercial-action';

export function useCreateCommercialAction() {
  const { data: session } = useSession();

  return useMutation((input: CommercialActionInput) =>
    apiRequest<CommercialAction>('/commercial-actions', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
