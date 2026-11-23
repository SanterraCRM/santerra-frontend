import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Goal, GoalInput } from '@/types/goal';

export function useCreateGoal() {
  const { data: session } = useSession();

  return useMutation((input: GoalInput) =>
    apiRequest<Goal>('/goals', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
