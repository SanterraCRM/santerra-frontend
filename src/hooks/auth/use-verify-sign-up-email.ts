import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

type VerifyEmailResponse = {
  verificationToken: string;
};

export function useVerifySignUpEmail() {
  return useMutation(async (email: string, code: string) => {
    const { verificationToken } = await apiRequest<VerifyEmailResponse>(
      '/auth/sign-up/verify-email',
      { method: 'POST', body: { email, code } },
    );

    return verificationToken;
  });
}
