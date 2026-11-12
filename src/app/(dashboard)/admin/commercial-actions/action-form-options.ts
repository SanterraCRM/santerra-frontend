import type { Session } from 'next-auth';

import { apiRequest } from '@/lib/api';
import { type AttachmentPermissions, getAttachmentPermissions } from '@/lib/permissions';
import { hasPermission } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Event } from '@/types/event';
import type { WalletListItem } from '@/types/wallet';

export type ActionWalletOption = {
  id: string;
  name: string;
  balance: number;
};

export type ActionFormOptions = {
  events: { id: string; name: string }[];
  wallets: ActionWalletOption[];
  canSearchProducers: boolean;
  canSearchResellers: boolean;
  canSearchEmployees: boolean;
  attachments: AttachmentPermissions | null;
};

export async function getActionFormOptions(session: Session): Promise<ActionFormOptions> {
  const token = session.accessToken;
  const [events, wallets] = await Promise.all([
    apiRequest<Paginated<Event>>('/events?limit=100', { token }),
    apiRequest<Paginated<WalletListItem>>('/wallets?limit=100', { token }),
  ]);

  return {
    events: events.data
      .map(({ id, name }) => ({ id, name }))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR')),
    wallets: wallets.data
      .map(({ id, member, value }) => ({ id, name: member.name, balance: value }))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR')),
    canSearchProducers: hasPermission(session, 'producers.read'),
    canSearchResellers: hasPermission(session, 'resellers.read'),
    canSearchEmployees: hasPermission(session, 'employees.read'),
    attachments: getAttachmentPermissions(session.permissions),
  };
}
