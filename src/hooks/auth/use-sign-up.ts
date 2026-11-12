import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

type SignUpInput = {
  name: string;
  email: string;
  password: string;
  companyName: string;
  verificationToken: string;
};

export function useSignUp() {
  return useMutation((input: SignUpInput) =>
    apiRequest<void>('/auth/sign-up', {
      method: 'POST',
      body: input,
    }),
  );
}
