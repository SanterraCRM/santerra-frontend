import type { Metadata } from 'next';

import { AuthHeader } from '@/components/auth/auth-header';
import { BackToLoginLink } from '@/components/auth/back-to-login-link';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, CheckCircleIcon } from '@/components/ui/icons';
import { apiRequest, isApiErrorWithStatus } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { InvitationPreview } from '@/types/invitation';

import AcceptInvitationForm from './accept-invitation-form';

export const metadata: Metadata = {
  title: 'Aceitar convite',
};

type AcceptInvitationPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type InvitationState =
  | { kind: 'preview'; preview: InvitationPreview }
  | { kind: 'not-found' }
  | { kind: 'unavailable' };

async function loadInvitation(token: string): Promise<InvitationState> {
  try {
    const preview = await apiRequest<InvitationPreview>(
      `/invitations/preview?token=${encodeURIComponent(token)}`,
    );

    return { kind: 'preview', preview };
  } catch (error) {
    return isApiErrorWithStatus(error, 404) || isApiErrorWithStatus(error, 400)
      ? { kind: 'not-found' }
      : { kind: 'unavailable' };
  }
}

type InvitationMessageProps = {
  title: string;
  description: string;
  isSuccess?: boolean;
};

function InvitationMessage({ title, description, isSuccess = false }: InvitationMessageProps) {
  const Icon = isSuccess ? CheckCircleIcon : AlertCircleIcon;

  return (
    <>
      <AuthHeader icon={<Icon className='size-7' />} title={title} description={description} />

      <Button href='/auth/login' size='xl' className='w-full animate-fade-up'>
        Ir para o login
      </Button>

      {!isSuccess && <BackToLoginLink />}
    </>
  );
}

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const { token } = await searchParams;

  if (typeof token !== 'string' || token.length === 0) {
    return (
      <InvitationMessage
        title='Link inválido'
        description='Este link de convite está incompleto. Abra de novo o link do e-mail do convite.'
      />
    );
  }

  const state = await loadInvitation(token);

  if (state.kind === 'unavailable') {
    return (
      <InvitationMessage
        title='Não foi possível abrir o convite'
        description='O servidor não respondeu agora. Tente abrir o link de novo em instantes.'
      />
    );
  }

  if (state.kind === 'not-found') {
    return (
      <InvitationMessage
        title='Convite não encontrado'
        description='Este convite não vale mais: ele pode ter sido cancelado ou trocado por um mais novo. Use o link do e-mail mais recente ou peça um novo convite ao administrador da empresa.'
      />
    );
  }

  const { preview } = state;

  if (preview.status === 'expired') {
    return (
      <InvitationMessage
        title='Este convite expirou'
        description={`O convite para ${preview.companyName} venceu em ${formatDate(preview.expiresAt, 'long')}. Peça um novo convite ao administrador da empresa.`}
      />
    );
  }

  if (preview.status === 'accepted') {
    return (
      <InvitationMessage
        isSuccess
        title='Convite já aceito'
        description={`Este convite para ${preview.companyName} já foi usado. É só entrar com o seu e-mail e a sua senha.`}
      />
    );
  }

  return <AcceptInvitationForm token={token} preview={preview} />;
}
