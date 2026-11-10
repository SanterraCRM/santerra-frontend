import { notFound } from 'next/navigation';

import { requireSession } from '@/lib/session';

export default async function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  if (!session.isPlatformAdmin) {
    notFound();
  }

  return children;
}
