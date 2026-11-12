import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

export function useDeleteRecord() {
  const { data: session } = useSession();

  return useMutation((path: string) =>
    apiRequest<void>(path, {
      method: 'DELETE',
      token: session?.accessToken,
    }),
  );
}
