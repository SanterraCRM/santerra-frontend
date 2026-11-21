import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { CreateMemberResult, NewMemberInput } from '@/types/member';

export function useCreateMember() {
  const { data: session } = useSession();

  return useMutation((input: NewMemberInput) =>
    apiRequest<CreateMemberResult>('/members', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
