import type { Session } from 'next-auth';

import { loadRoleOptions } from '@/lib/role-options';
import { hasPermission } from '@/lib/session';

import type { EmployeeAccessOptions } from './employee-form';

export async function getEmployeeAccessOptions(
  session: Session,
): Promise<EmployeeAccessOptions | null> {
  if (!session.company || !hasPermission(session, 'members.create')) {
    return null;
  }

  const roleOptions = await loadRoleOptions(session);

  if (!roleOptions) {
    return null;
  }

  return { companyName: session.company.name, roleOptions };
}
