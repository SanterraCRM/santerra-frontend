import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Wallet, WalletAdjustmentInput } from '@/types/wallet';

export function useAdjustWallet() {
  const { data: session } = useSession();

  return useMutation((id: string, input: WalletAdjustmentInput) =>
    apiRequest<Wallet>(`/wallets/${id}/adjustments`, {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
