import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';

export function useSelectCompany() {
  const { update } = useSession();

  return useMutation(async (companyId: string) => {
    const session = await update({ companyId });

    if (session?.company?.id !== companyId) {
      throw new Error('A empresa selecionada não foi aplicada à sessão.');
    }
  });
}
