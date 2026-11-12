import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Event, EventInput } from '@/types/event';

export function useUpdateEvent() {
  const { data: session } = useSession();

  return useMutation((id: string, input: EventInput) =>
    apiRequest<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
