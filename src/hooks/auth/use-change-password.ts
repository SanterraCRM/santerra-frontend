import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { ChangePasswordInput } from '@/types/account';

export function useChangePassword() {
  const { data: session } = useSession();

  return useMutation((input: ChangePasswordInput) =>
    apiRequest<void>('/auth/me/password', {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
