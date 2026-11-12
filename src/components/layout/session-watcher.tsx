'use client';

import { useSession } from 'next-auth/react';

import { SESSION_ENDED_PATH } from '@/lib/callback-url';

export function SessionWatcher() {
  useSession({
    required: true,
    onUnauthenticated() {
      window.location.replace(SESSION_ENDED_PATH);
    },
  });

  return null;
}
