'use client';

import { ArrowLeftRight, Building2, LogOut, Plus, UserRound } from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/initials';

type UserAvatarProps = {
  name: string;
  className?: string;
};

function UserAvatar({ name, className }: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <Avatar className={className}>
      <AvatarFallback className='bg-linear-to-br from-brand-400 to-brand-600 text-sm font-bold text-white'>
        {initials || <UserRound className='size-4' />}
      </AvatarFallback>
    </Avatar>
  );
}

type UserMenuProps = {
  userName: string;
  email: string;
  companyName: string;
  canSwitchCompany: boolean;
};

export function UserMenu(props: UserMenuProps) {
  const { data: session } = useSession();
  const userName = session?.user.name ?? props.userName;
  const email = session?.user.email ?? props.email;
  const companyName =
    session?.company?.name ?? (props.companyName || 'Nenhuma empresa selecionada');
  const canSwitchCompany = session ? session.companies.length > 1 : props.canSwitchCompany;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='Abrir menu da conta'
        className={cn(
          'rounded-full ring-offset-2 ring-offset-background outline-none transition',
          'hover:ring-2 hover:ring-brand-200 focus-visible:ring-2 focus-visible:ring-ring',
          'data-[state=open]:ring-2 data-[state=open]:ring-brand-300',
          'dark:hover:ring-brand-800 dark:data-[state=open]:ring-brand-700',
        )}
      >
        <UserAvatar name={userName} className='size-9' />
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' sideOffset={8} className='w-64'>
        <DropdownMenuLabel className='flex items-center gap-3 py-2 font-normal text-foreground'>
          <UserAvatar name={userName} className='size-10' />
          <span className='grid min-w-0'>
            <span className='truncate text-sm font-semibold'>{userName}</span>
            <span className='truncate text-xs text-muted-foreground'>{email}</span>
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className='flex items-center gap-2'>
          <Building2 className='size-4 shrink-0' />
          <span className='truncate'>{companyName}</span>
        </DropdownMenuLabel>

        {canSwitchCompany && (
          <DropdownMenuItem asChild>
            <Link href='/auth/select-company'>
              <ArrowLeftRight />
              Trocar empresa
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href='/auth/create-company'>
            <Plus />
            Criar nova empresa
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant='destructive'
          onSelect={() => signOut({ callbackUrl: '/auth/login' })}
        >
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
