import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { PlatformUser, PlatformUserInput } from '@/types/platform';

export function useUpdatePlatformUser() {
  const { data: session } = useSession();

  return useMutation((id: string, input: PlatformUserInput) =>
    apiRequest<PlatformUser>(`/users/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
