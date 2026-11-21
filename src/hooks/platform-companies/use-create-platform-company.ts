import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import { withCompanyLogo } from '@/lib/company-logo';
import type { NewPlatformCompanyInput, PlatformCompany } from '@/types/platform';

export function useCreatePlatformCompany() {
  const { data: session } = useSession();

  return useMutation(({ name, description, ownerEmail, logo }: NewPlatformCompanyInput) =>
    apiRequest<PlatformCompany>('/companies', {
      method: 'POST',
      body: withCompanyLogo({ name, description, ownerEmail }, logo),
      token: session?.accessToken,
    }),
  );
}
