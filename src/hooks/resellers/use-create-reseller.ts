import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Reseller, ResellerInput } from '@/types/reseller';

export function useCreateReseller() {
  const { data: session } = useSession();

  return useMutation((input: ResellerInput) =>
    apiRequest<Reseller>('/resellers', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
