import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Group, GroupInput } from '@/types/group';

export function useUpdateGroup() {
  const { data: session } = useSession();

  return useMutation((id: string, input: GroupInput) =>
    apiRequest<Group>(`/groups/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
