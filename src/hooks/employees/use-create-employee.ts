import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Employee, EmployeeInput } from '@/types/employee';

export function useCreateEmployee() {
  const { data: session } = useSession();

  return useMutation((personId: string, input: EmployeeInput) =>
    apiRequest<Employee>('/employees', {
      method: 'POST',
      body: { personId, ...input },
      token: session?.accessToken,
    }),
  );
}
