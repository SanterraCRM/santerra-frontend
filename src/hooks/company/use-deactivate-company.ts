import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

export function useDeactivateCompany() {
  const { data: session } = useSession();

  return useMutation((password: string) =>
    apiRequest<void>('/companies/current/deactivate', {
      method: 'POST',
      body: { password },
      token: session?.accessToken,
    }),
  );
}
