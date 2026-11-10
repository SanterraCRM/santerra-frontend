import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Wallet, WalletInput } from '@/types/wallet';

export function useCreateWallet() {
  const { data: session } = useSession();

  return useMutation((input: WalletInput) =>
    apiRequest<Wallet>('/wallets', {
      method: 'POST',
      body: input,
      token: session?.accessToken,
    }),
  );
}
