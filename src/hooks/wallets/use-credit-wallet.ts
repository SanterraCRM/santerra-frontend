import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Wallet } from '@/types/wallet';

export function useCreditWallet() {
  const { data: session } = useSession();

  return useMutation((id: string, amount: number) =>
    apiRequest<Wallet>(`/wallets/${id}/credits`, {
      method: 'POST',
      body: { amount },
      token: session?.accessToken,
    }),
  );
}
