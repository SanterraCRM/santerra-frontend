import type { Session } from 'next-auth';

import { apiRequest } from '@/lib/api';
import { getRoleOptions, type RoleOption } from '@/lib/permissions';
import { hasPermission } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Permission } from '@/types/permission';
import type { Role } from '@/types/role';

export async function loadRoleOptions(session: Session): Promise<RoleOption[] | null> {
  if (!hasPermission(session, 'roles.read')) {
    return null;
  }

  const [roles, permissions] = await Promise.all([
    apiRequest<Paginated<Role>>('/roles?limit=100', { token: session.accessToken }),
    apiRequest<Paginated<Permission>>('/permissions?limit=100', { token: session.accessToken }),
  ]);

  return getRoleOptions(roles.data, permissions.data, session.permissions);
}
