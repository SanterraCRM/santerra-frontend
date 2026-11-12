import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Group, GroupInput } from '@/types/group';

export function useCreateGroup() {
  const { data: session } = useSession();

  return useMutation((input: GroupInput) =>
    apiRequest<Group>('/groups', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
