import type { Session } from 'next-auth';

import { apiRequest } from '@/lib/api';
import { type AttachmentPermissions, getAttachmentPermissions } from '@/lib/permissions';
import { hasPermission } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { CommercialTripRelation } from '@/types/commercial-trip';

export type TripFormOptions = {
  harvests: CommercialTripRelation[];
  canSearchProducers: boolean;
  canSearchEmployees: boolean;
  canReadProducts: boolean;
  attachments: AttachmentPermissions | null;
};

export async function getTripFormOptions(session: Session): Promise<TripFormOptions> {
  const harvests = await apiRequest<Paginated<CommercialTripRelation>>('/harvests?limit=100', {
    token: session.accessToken,
  });

  return {
    harvests: harvests.data.map(({ id, name }) => ({ id, name })),
    canSearchProducers: hasPermission(session, 'producers.read'),
    canSearchEmployees: hasPermission(session, 'employees.read'),
    canReadProducts: hasPermission(session, 'products.read'),
    attachments: getAttachmentPermissions(session.permissions),
  };
}
