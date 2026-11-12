import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Invitation, InvitationInput } from '@/types/invitation';

export function useCreateInvitation() {
  const { data: session } = useSession();

  return useMutation((input: InvitationInput) =>
    apiRequest<Invitation>('/invitations', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
