import { cookies } from 'next/headers';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SessionWatcher } from '@/components/layout/session-watcher';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireSession } from '@/lib/session';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const cookieStore = await cookies();
  const companyName = session.company?.name ?? '';

  return (
    <SidebarProvider defaultOpen={cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== 'false'}>
      <SessionWatcher />
      <AppSidebar
        companyName={companyName}
        permissions={session.permissions}
        isPlatformAdmin={session.isPlatformAdmin}
      />
      <SidebarInset>
        <AppHeader
          userName={session.user.name}
          email={session.user.email}
          companyName={companyName}
          canSwitchCompany={session.companies.length > 1}
        />
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
