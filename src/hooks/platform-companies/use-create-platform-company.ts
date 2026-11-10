import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { PlatformCompany, PlatformCompanyInput } from '@/types/platform';

export function useCreatePlatformCompany() {
  const { data: session } = useSession();

  return useMutation((input: PlatformCompanyInput) =>
    apiRequest<PlatformCompany>('/companies', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
