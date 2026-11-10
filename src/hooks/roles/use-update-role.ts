import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Role, RoleInput } from '@/types/role';

export function useUpdateRole() {
  const { data: session } = useSession();

  return useMutation((id: string, input: RoleInput) =>
    apiRequest<Role>(`/roles/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
