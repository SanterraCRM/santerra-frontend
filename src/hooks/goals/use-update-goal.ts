import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Goal, GoalInput } from '@/types/goal';

export function useUpdateGoal() {
  const { data: session } = useSession();

  return useMutation((id: string, input: GoalInput) =>
    apiRequest<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
