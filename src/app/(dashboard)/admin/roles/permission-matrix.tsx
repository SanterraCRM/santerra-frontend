'use client';

import { LockKeyhole } from 'lucide-react';
import { Fragment } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/cn';
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCE_GROUPS,
  type PermissionAction,
  type PermissionResource,
} from '@/lib/permissions';
import type { Permission } from '@/types/permission';

const NOT_GRANTABLE_REASON = 'Você não tem esta permissão, então não pode concedê-la.';
const DEPENDENT_ACTIONS: PermissionAction[] = ['create', 'update', 'delete'];

type PermissionMatrixProps = {
  permissions: Permission[];
  value: string[];
  grantedPermissions: string[];
  onChange?: (permissionIds: string[]) => void;
  readOnly?: boolean;
};

export function PermissionMatrix({
  permissions,
  value,
  grantedPermissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const selected = new Set(value);
  const granted = new Set(grantedPermissions);
  const byName = new Map(permissions.map((permission) => [permission.name, permission]));
  const hasLockedPermission = !readOnly && permissions.some(({ name }) => !granted.has(name));

  function findPermission(resource: PermissionResource, action: PermissionAction) {
    return byName.get(`${resource.key}.${action}`);
  }

  function grantableIds(resource: PermissionResource, actions: PermissionAction[]): string[] {
    return actions
      .map((action) => findPermission(resource, action))
      .filter((permission): permission is Permission => Boolean(permission && granted.has(permission.name)))
      .map((permission) => permission.id);
  }

  function toggle(resource: PermissionResource, action: PermissionAction, checked: boolean) {
    const permission = findPermission(resource, action);

    if (!permission || !onChange) {
      return;
    }

    const next = new Set(selected);

    if (checked) {
      next.add(permission.id);

      if (action !== 'read') {
        grantableIds(resource, ['read']).forEach((id) => next.add(id));
      }
    } else {
      next.delete(permission.id);

      if (action === 'read') {
        grantableIds(resource, DEPENDENT_ACTIONS).forEach((id) => next.delete(id));
      }
    }

    onChange([...next].sort());
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader className='bg-muted/50'>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='px-3 text-muted-foreground sm:px-4'>Recurso</TableHead>
              {PERMISSION_ACTIONS.map((action) => (
                <TableHead
                  key={action}
                  className='w-12 px-1 text-center text-muted-foreground sm:w-20 sm:px-2'
                >
                  {PERMISSION_ACTION_LABELS[action]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {PERMISSION_RESOURCE_GROUPS.map((group) => (
              <Fragment key={group.label}>
                <TableRow className='bg-muted/30 hover:bg-muted/30'>
                  <TableCell
                    colSpan={PERMISSION_ACTIONS.length + 1}
                    className='px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-4'
                  >
                    {group.label}
                  </TableCell>
                </TableRow>

                {group.resources.map((resource) => (
                  <TableRow key={resource.key}>
                    <TableCell className='px-3 font-medium whitespace-normal sm:px-4'>
                      {resource.label}
                    </TableCell>

                    {PERMISSION_ACTIONS.map((action) => {
                      const permission = findPermission(resource, action);

                      if (!permission) {
                        return (
                          <TableCell key={action} className='px-1 text-center sm:px-2'>
                            <span aria-hidden='true' className='text-muted-foreground/60'>
                              —
                            </span>
                          </TableCell>
                        );
                      }

                      const isLocked = !granted.has(permission.name);

                      return (
                        <TableCell
                          key={action}
                          title={isLocked && !readOnly ? NOT_GRANTABLE_REASON : permission.description ?? undefined}
                          className='px-1 text-center sm:px-2'
                        >
                          <span className='inline-flex items-center justify-center'>
                            <Checkbox
                              checked={selected.has(permission.id)}
                              disabled={readOnly || isLocked}
                              aria-label={`${PERMISSION_ACTION_LABELS[action]} ${resource.label}`}
                              onCheckedChange={(checked) => toggle(resource, action, checked === true)}
                              className={cn(readOnly && 'disabled:opacity-100')}
                            />
                          </span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasLockedPermission && (
        <p className='flex items-start gap-2 text-xs text-muted-foreground'>
          <LockKeyhole className='mt-px size-3.5 shrink-0' />
          As permissões desabilitadas são as que você não tem: só é possível conceder o que você
          também pode fazer.
        </p>
      )}
    </div>
  );
}
