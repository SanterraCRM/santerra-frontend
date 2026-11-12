import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { CreatePersonInput, Person } from '@/types/person';

export function useCreatePerson() {
  const { data: session } = useSession();

  return useMutation((input: CreatePersonInput) =>
    apiRequest<Person>('/persons', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
