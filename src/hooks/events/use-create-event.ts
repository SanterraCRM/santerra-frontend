import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Event, EventInput } from '@/types/event';

export function useCreateEvent() {
  const { data: session } = useSession();

  return useMutation((input: EventInput) =>
    apiRequest<Event>('/events', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
