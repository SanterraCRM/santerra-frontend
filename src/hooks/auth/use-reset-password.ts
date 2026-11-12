import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

export function useResetPassword() {
  return useMutation((token: string, password: string) =>
    apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),
  );
}
