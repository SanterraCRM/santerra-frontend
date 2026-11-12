'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/cn';

import {
  getVisibleNavSections,
  isNavGroup,
  isNavGroupActive,
  isNavItemActive,
  type NavGroup,
  type NavItem,
} from './nav-items';

const ACTIVE_BAR_CLASS =
  'relative before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-sidebar-primary before:opacity-0 data-active:before:opacity-100';

const MENU_BUTTON_CLASS = cn(
  ACTIVE_BAR_CLASS,
  'h-9 font-medium text-foreground/80 hover:bg-sidebar-foreground/5 hover:text-foreground data-open:hover:bg-sidebar-foreground/5 data-open:hover:text-foreground data-active:bg-sidebar-accent data-active:font-semibold data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:before:hidden',
);

const SUB_MENU_CLASS = 'mt-0.5 mr-0 ml-5 translate-x-0 gap-0 border-l-0 px-0 py-0';

const SUB_BUTTON_CLASS = cn(
  ACTIVE_BAR_CLASS,
  'h-7.5 translate-x-0 gap-2.5 text-sidebar-foreground hover:bg-sidebar-foreground/5 hover:text-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground [&>svg]:text-sidebar-foreground/80 hover:[&>svg]:text-foreground data-active:[&>svg]:text-sidebar-accent-foreground',
);

type NavLinkProps = {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
};

function NavLink({ item: { title, href, icon: Icon }, pathname, onNavigate }: NavLinkProps) {
  const isActive = isNavItemActive(pathname, href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={title} className={MENU_BUTTON_CLASS}>
        <Link href={href} aria-current={isActive ? 'page' : undefined} onClick={onNavigate}>
          <Icon />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

type NavGroupMenuProps = {
  group: NavGroup;
  pathname: string;
  isOpen: boolean;
  showsOnlyIcons: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
};

function NavGroupMenu({
  group: { title, icon: Icon, items },
  pathname,
  isOpen,
  showsOnlyIcons,
  onOpenChange,
  onNavigate,
}: NavGroupMenuProps) {
  const hasActiveItem = items.some((item) => isNavItemActive(pathname, item.href));

  if (showsOnlyIcons) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton isActive={hasActiveItem} aria-label={title} className={MENU_BUTTON_CLASS}>
              <Icon />
              <span>{title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='right' align='start' sideOffset={10} className='min-w-48'>
            <DropdownMenuLabel className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
              {title}
            </DropdownMenuLabel>
            {items.map(({ title: itemTitle, href, icon: ItemIcon }) => {
              const isActive = isNavItemActive(pathname, href);

              return (
                <DropdownMenuItem
                  key={href}
                  asChild
                  className={cn(isActive && 'bg-accent font-medium text-accent-foreground')}
                >
                  <Link href={href} aria-current={isActive ? 'page' : undefined}>
                    <ItemIcon />
                    {itemTitle}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild open={isOpen} onOpenChange={onOpenChange} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              MENU_BUTTON_CLASS,
              hasActiveItem && 'text-foreground [&>svg:first-child]:text-sidebar-primary',
            )}
          >
            <Icon />
            <span>{title}</span>
            <ChevronDown className='ml-auto text-sidebar-foreground/60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className={SUB_MENU_CLASS}>
            {items.map(({ title: itemTitle, href, icon: ItemIcon }) => {
              const isActive = isNavItemActive(pathname, href);

              return (
                <SidebarMenuSubItem key={href}>
                  <SidebarMenuSubButton asChild isActive={isActive} className={SUB_BUTTON_CLASS}>
                    <Link href={href} aria-current={isActive ? 'page' : undefined} onClick={onNavigate}>
                      <ItemIcon />
                      <span>{itemTitle}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

type GroupToggle = {
  isOpen: boolean;
  pathname: string;
};

type AppSidebarProps = {
  companyName: string;
  permissions: string[];
  isPlatformAdmin: boolean;
};

export function AppSidebar({ companyName, permissions, isPlatformAdmin }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const [groupToggles, setGroupToggles] = useState<Record<string, GroupToggle>>({});
  const sections = getVisibleNavSections(
    session?.permissions ?? permissions,
    session?.isPlatformAdmin ?? isPlatformAdmin,
  );
  const currentCompanyName = session?.company?.name ?? companyName;
  const showsOnlyIcons = state === 'collapsed' && !isMobile;

  function closeMobileMenu() {
    setOpenMobile(false);
  }

  function isGroupOpen(group: NavGroup): boolean {
    const toggle = groupToggles[group.title];
    const hasActiveItem = isNavGroupActive(pathname, group);

    if (!toggle) {
      return hasActiveItem;
    }

    return (hasActiveItem && toggle.pathname !== pathname) || toggle.isOpen;
  }

  function setGroupOpen(title: string, isOpen: boolean) {
    setGroupToggles((current) => ({ ...current, [title]: { isOpen, pathname } }));
  }

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              className='hover:bg-transparent active:bg-transparent'
            >
              <Link href='/admin' onClick={closeMobileMenu}>
                <Image
                  src='/logo.png'
                  alt=''
                  width={32}
                  height={32}
                  priority
                  className='size-8 shrink-0 rounded-full shadow-md shadow-brand-600/20'
                />
                <span className='grid min-w-0 leading-tight'>
                  <span className='truncate text-base font-bold tracking-tight text-foreground'>
                    WebUp!
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>{currentCompanyName}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map(({ label, entries }) => (
          <SidebarGroup key={label ?? 'principal'} className='py-1'>
            {label && (
              <SidebarGroupLabel className='h-7 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60 uppercase'>
                {label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className='gap-0.5'>
                {entries.map((entry) =>
                  isNavGroup(entry) ? (
                    <NavGroupMenu
                      key={entry.title}
                      group={entry}
                      pathname={pathname}
                      isOpen={isGroupOpen(entry)}
                      showsOnlyIcons={showsOnlyIcons}
                      onOpenChange={(isOpen) => setGroupOpen(entry.title, isOpen)}
                      onNavigate={closeMobileMenu}
                    />
                  ) : (
                    <NavLink
                      key={entry.href}
                      item={entry}
                      pathname={pathname}
                      onNavigate={closeMobileMenu}
                    />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Sair'
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className='h-9 justify-center font-medium group-data-[collapsible=icon]:justify-start hover:bg-destructive/10 hover:text-destructive active:bg-destructive/10 active:text-destructive'
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
