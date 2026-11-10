import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Reseller, ResellerInput } from '@/types/reseller';

export function useUpdateReseller() {
  const { data: session } = useSession();

  return useMutation((id: string, input: ResellerInput) =>
    apiRequest<Reseller>(`/resellers/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
