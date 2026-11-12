import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { StatusTone } from '@/components/list/status-badge';
import type { FilterDefinition } from '@/lib/list-filters';
import type { Invitation, InvitationStatus } from '@/types/invitation';

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pendente', tone: 'warning' },
  accepted: { label: 'Aceito', tone: 'success' },
  expired: { label: 'Expirado', tone: 'neutral' },
};

export const INVITATION_FILTERS: FilterDefinition[] = [
  {
    type: 'select',
    key: 'status',
    label: 'Situação',
    options: [
      { value: 'pending', label: 'Pendentes' },
      { value: 'accepted', label: 'Aceitos' },
      { value: 'expired', label: 'Expirados' },
    ],
  },
];

export const INVITATION_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum convite encontrado',
  filtersDescription: 'Nenhum convite corresponde aos filtros aplicados.',
  searchHint: 'Confira o e-mail digitado.',
  emptyTitle: 'Nenhum convite enviado',
  emptyDescription: 'Convide pessoas para a equipe: elas recebem um link por e-mail para entrar na empresa.',
  emptyReadOnlyDescription: 'Quando houver convites enviados, eles aparecerão aqui.',
};

export function getInvitationStatus(invitation: Invitation, now = new Date()): InvitationStatus {
  if (invitation.acceptedAt) {
    return 'accepted';
  }

  return new Date(invitation.expiresAt) <= now ? 'expired' : 'pending';
}

export function getInvitationDeleteTexts(status: InvitationStatus): DeleteDialogTexts | undefined {
  if (status === 'pending') {
    return {
      actionLabel: 'Revogar convite',
      title: 'Revogar este convite?',
      description:
        'O link enviado por e-mail deixa de funcionar. Você pode convidar a pessoa de novo quando quiser.',
      confirmLabel: 'Revogar convite',
      successMessage: 'Convite revogado.',
      errorMessage: 'Não foi possível revogar o convite. Tente novamente.',
    };
  }

  if (status === 'expired') {
    return {
      actionLabel: 'Excluir convite',
      title: 'Excluir este convite?',
      description: 'O convite já expirou e sai da lista. Para chamar a pessoa, envie um convite novo.',
      confirmLabel: 'Excluir convite',
      successMessage: 'Convite excluído.',
      errorMessage: 'Não foi possível excluir o convite. Tente novamente.',
    };
  }

  return undefined;
}
