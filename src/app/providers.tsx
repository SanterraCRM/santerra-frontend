'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

const SESSION_REFETCH_INTERVAL_IN_SECONDS = 60;
const QUERY_STALE_TIME_MS = 30 * 1000;

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: QUERY_STALE_TIME_MS, retry: 1, refetchOnWindowFocus: false },
    },
  });
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [queryClient] = useState(createQueryClient);

  return (
    <SessionProvider refetchInterval={SESSION_REFETCH_INTERVAL_IN_SECONDS}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          disableTransitionOnChange
          forcedTheme={pathname.startsWith('/auth') ? 'light' : undefined}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
