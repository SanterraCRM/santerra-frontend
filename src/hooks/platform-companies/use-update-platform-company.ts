import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { PlatformCompany, PlatformCompanyInput } from '@/types/platform';

export function useUpdatePlatformCompany() {
  const { data: session } = useSession();

  return useMutation((id: string, input: PlatformCompanyInput) =>
    apiRequest<PlatformCompany>(`/companies/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
