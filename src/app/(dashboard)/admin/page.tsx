import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DashboardSkeleton } from '@/components/layout/page-skeleton';
import { requireSession } from '@/lib/session';

import { getDashboardShortcuts } from './dashboard-config';
import DashboardOverview from './dashboard-overview';
import WelcomeBanner from './welcome-banner';

export const metadata: Metadata = {
  title: 'Início',
};

export default async function AdminPage() {
  const session = await requireSession();
  const [firstName] = session.user.name.split(' ');

  return (
    <div className='flex flex-col gap-6'>
      <WelcomeBanner firstName={firstName} shortcuts={getDashboardShortcuts(session.permissions)} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview session={session} />
      </Suspense>
    </div>
  );
}
