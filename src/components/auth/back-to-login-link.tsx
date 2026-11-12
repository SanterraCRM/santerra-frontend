import Link from 'next/link';

import { ArrowLeftIcon } from '@/components/ui/icons';

export function BackToLoginLink() {
  return (
    <Link
      href='/auth/login'
      className='group mx-auto mt-8 flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
    >
      <ArrowLeftIcon className='size-4 transition-transform group-hover:-translate-x-0.5' />
      Voltar para o login
    </Link>
  );
}
