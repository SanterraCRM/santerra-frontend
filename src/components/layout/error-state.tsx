'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  retry?: () => void;
};

export function ErrorState({ retry }: ErrorStateProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  function handleRetry() {
    if (retry) {
      retry();
      return;
    }

    startRefresh(() => router.refresh());
  }

  return (
    <div className='flex flex-col items-start gap-4'>
      <Alert variant='error' title='Não foi possível carregar os dados'>
        Verifique sua conexão e tente novamente.
      </Alert>
      <Button variant='outline' onClick={handleRetry} loading={isRefreshing} loadingText='Tentando...'>
        Tentar novamente
      </Button>
    </div>
  );
}
