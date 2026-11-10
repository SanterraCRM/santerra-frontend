import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Manufacturer, ManufacturerInput } from '@/types/manufacturer';

export function useUpdateManufacturer() {
  const { data: session } = useSession();

  return useMutation((id: string, input: ManufacturerInput) =>
    apiRequest<Manufacturer>(`/manufacturers/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
