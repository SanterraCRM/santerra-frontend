import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Account, ProfileInput } from '@/types/account';

export function useUpdateProfile() {
  const { data: session } = useSession();

  return useMutation((input: ProfileInput) =>
    apiRequest<Account>('/auth/me', {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
