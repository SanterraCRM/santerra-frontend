import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Company, CompanyInput } from '@/types/company';

export function useUpdateCompany() {
  const { data: session } = useSession();

  return useMutation((input: CompanyInput) =>
    apiRequest<Company>('/companies/current', {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
