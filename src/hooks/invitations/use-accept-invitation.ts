import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { AcceptInvitationInput, AcceptInvitationResult } from '@/types/invitation';

export function useAcceptInvitation() {
  return useMutation((input: AcceptInvitationInput) =>
    apiRequest<AcceptInvitationResult>('/invitations/accept', {
      method: 'POST',
      body: input,
    }),
  );
}
