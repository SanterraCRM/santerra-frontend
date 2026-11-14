'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

import { ErrorState } from '@/components/layout/error-state';
import { SESSION_ENDED_PATH } from '@/lib/callback-url';

type DashboardErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function DashboardError({ retry }: DashboardErrorProps) {
  const { status, update } = useSession();
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || hasCheckedSession.current) {
      return;
    }

    hasCheckedSession.current = true;
    void update().then((session) => {
      if (session === null) {
        window.location.replace(SESSION_ENDED_PATH);
      }
    });
  }, [status, update]);

  return <ErrorState retry={retry} />;
}
