import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { useLogin } from '@/hooks/auth/use-login';
import { useAcceptInvitation } from '@/hooks/invitations/use-accept-invitation';
import { getApiErrorMessage, isApiErrorWithStatus } from '@/lib/api';
import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';
import type { InvitationPreview } from '@/types/invitation';

type AcceptValues = {
  name?: string;
  password: string;
};

type AcceptError = {
  message: string;
  field?: 'password';
};

export function useAcceptInvitationFlow(token: string, preview: InvitationPreview) {
  const { data: session } = useSession();
  const { mutate: acceptInvitation } = useAcceptInvitation();
  const { mutate: login } = useLogin();
  const [error, setError] = useState<AcceptError | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const otherAccountEmail =
    session && session.user.email.toLowerCase() !== preview.email ? session.user.email : null;

  async function accept({ name, password }: AcceptValues): Promise<AcceptError | null> {
    setError(null);
    let companyId: string;

    try {
      ({ companyId } = await acceptInvitation({ token, name, password }));
    } catch (acceptError) {
      const failure: AcceptError = {
        message: getApiErrorMessage(
          acceptError,
          'Não foi possível aceitar o convite agora. Tente novamente em instantes.',
        ),
        field: isApiErrorWithStatus(acceptError, 401) ? 'password' : undefined,
      };

      setError(failure);
      return failure;
    }

    try {
      if (otherAccountEmail) {
        await signOut({ redirect: false });
      }

      await login({ email: preview.email, password, companyId });
    } catch {
      const failure: AcceptError = {
        message:
          'O convite foi aceito, mas não conseguimos entrar automaticamente. Entre com o seu e-mail e a sua senha.',
      };

      setError(failure);
      return failure;
    }

    setIsRedirecting(true);
    window.location.assign(DEFAULT_CALLBACK_URL);
    return null;
  }

  return { accept, error, isRedirecting, otherAccountEmail };
}
