import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Product, ProductInput } from '@/types/product';

export function useUpdateProduct() {
  const { data: session } = useSession();

  return useMutation((id: string, input: ProductInput) =>
    apiRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: input,
      token: session?.accessToken,
    }),
  );
}
