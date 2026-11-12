import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Employee, EmployeeInput } from '@/types/employee';

export function useUpdateEmployee() {
  const { data: session } = useSession();

  return useMutation((id: string, input: EmployeeInput) =>
    apiRequest<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
