import { signIn } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { LoginError } from '@/lib/auth-errors';
import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';

type LoginCredentials = {
  email: string;
  password: string;
  companyId?: string;
};

export function useLogin() {
  return useMutation(async ({ email, password, companyId }: LoginCredentials) => {
    const result = await signIn('credentials', {
      email,
      password,
      ...(companyId && { companyId }),
      redirect: false,
      callbackUrl: DEFAULT_CALLBACK_URL,
    });

    if (!result?.ok || result.error) {
      throw new LoginError(result?.error);
    }
  });
}
