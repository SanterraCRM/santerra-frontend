import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { MemberDetails, MemberInput } from '@/types/member';

export function useUpdateMember() {
  const { data: session } = useSession();

  return useMutation((id: string, input: MemberInput) =>
    apiRequest<MemberDetails>(`/members/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
