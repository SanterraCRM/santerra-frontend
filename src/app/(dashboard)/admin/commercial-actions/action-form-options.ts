import type { Session } from 'next-auth';

import { hasRecords } from '@/lib/api';
import { type AttachmentPermissions, getAttachmentPermissions } from '@/lib/permissions';
import { hasPermission } from '@/lib/session';

export type ActionFormOptions = {
  hasEvents: boolean;
  hasWallets: boolean;
  canSearchProducers: boolean;
  canSearchResellers: boolean;
  canSearchEmployees: boolean;
  attachments: AttachmentPermissions | null;
};

export async function getActionFormOptions(session: Session): Promise<ActionFormOptions> {
  const token = session.accessToken;
  const [hasEvents, hasWallets] = await Promise.all([
    hasRecords('/events', token),
    hasRecords('/wallets', token),
  ]);

  return {
    hasEvents,
    hasWallets,
    canSearchProducers: hasPermission(session, 'producers.read'),
    canSearchResellers: hasPermission(session, 'resellers.read'),
    canSearchEmployees: hasPermission(session, 'employees.read'),
    attachments: getAttachmentPermissions(session.permissions),
  };
}
