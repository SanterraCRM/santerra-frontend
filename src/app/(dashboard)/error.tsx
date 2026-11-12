'use client';

import { ErrorState } from '@/components/layout/error-state';

type DashboardErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function DashboardError({ retry }: DashboardErrorProps) {
  return <ErrorState retry={retry} />;
}
