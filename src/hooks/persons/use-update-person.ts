import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Person, PersonInput } from '@/types/person';

export function useUpdatePerson() {
  const { data: session } = useSession();

  return useMutation((id: string, input: PersonInput) =>
    apiRequest<Person>(`/persons/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
