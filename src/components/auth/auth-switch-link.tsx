import Link from 'next/link';

type AuthSwitchLinkProps = {
  question: string;
  href: string;
  label: string;
};

export function AuthSwitchLink({ question, href, label }: AuthSwitchLinkProps) {
  return (
    <p className='mt-8 text-center text-sm text-slate-500 animate-fade-up [animation-delay:160ms]'>
      {question}{' '}
      <Link
        href={href}
        className='rounded font-semibold text-brand-600 transition hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
      >
        {label}
      </Link>
    </p>
  );
}
