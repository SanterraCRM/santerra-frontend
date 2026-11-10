import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

type CreateCompanyInput = {
  name: string;
  description: string | null;
};

type CreatedCompany = {
  id: string;
  name: string;
};

export function useCreateCompany() {
  const { data: session } = useSession();

  return useMutation((input: CreateCompanyInput) =>
    apiRequest<CreatedCompany>('/auth/companies', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
