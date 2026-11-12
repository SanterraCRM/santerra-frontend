import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Role, RoleInput } from '@/types/role';

export function useCreateRole() {
  const { data: session } = useSession();

  return useMutation((input: RoleInput) =>
    apiRequest<Role>('/roles', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
