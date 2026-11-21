import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import { withCompanyLogo } from '@/lib/company-logo';
import type { NewCompanyInput } from '@/types/company';

type CreatedCompany = {
  id: string;
  name: string;
};

export function useCreateCompany() {
  const { data: session } = useSession();

  return useMutation(({ name, description, logo }: NewCompanyInput) =>
    apiRequest<CreatedCompany>('/auth/companies', {
      method: 'POST',
      body: withCompanyLogo({ name, description }, logo),
      token: session?.accessToken,
    }),
  );
}
