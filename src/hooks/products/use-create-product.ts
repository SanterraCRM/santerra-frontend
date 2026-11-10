import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Product, ProductInput } from '@/types/product';

export function useCreateProduct() {
  const { data: session } = useSession();

  return useMutation((input: ProductInput) =>
    apiRequest<Product>('/products', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
