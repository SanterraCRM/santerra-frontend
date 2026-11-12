import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

export function useRequestPasswordReset() {
  return useMutation((email: string) =>
    apiRequest<void>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),
  );
}
