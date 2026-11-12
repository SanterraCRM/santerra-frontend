import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

export function useSendSignUpCode() {
  return useMutation((email: string) =>
    apiRequest<void>('/auth/sign-up/verification-code', {
      method: 'POST',
      body: { email },
    }),
  );
}
