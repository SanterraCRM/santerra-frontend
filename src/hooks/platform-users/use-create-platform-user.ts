import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { PlatformUser, PlatformUserInput } from '@/types/platform';

export function useCreatePlatformUser() {
  const { data: session } = useSession();

  return useMutation((input: PlatformUserInput) =>
    apiRequest<PlatformUser>('/users', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
