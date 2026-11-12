import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Manufacturer, ManufacturerInput } from '@/types/manufacturer';

export function useCreateManufacturer() {
  const { data: session } = useSession();

  return useMutation((input: ManufacturerInput) =>
    apiRequest<Manufacturer>('/manufacturers', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
