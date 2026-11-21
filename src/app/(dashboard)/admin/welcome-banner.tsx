import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

import type { DashboardShortcut } from './dashboard-config';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Sao_Paulo',
});

const SHORTCUT_CLASS = 'focus-visible:ring-white/60 md:w-full md:justify-start';
const MAIN_SHORTCUT_CLASS =
  'bg-white text-brand-700 shadow-sm hover:bg-white/90 dark:bg-white dark:text-brand-800 dark:hover:bg-white/90';
const SECONDARY_SHORTCUT_CLASS =
  'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/25 hover:text-white';

type WelcomeBannerProps = {
  firstName: string;
  shortcuts: DashboardShortcut[];
};

export default function WelcomeBanner({ firstName, shortcuts }: WelcomeBannerProps) {
  const today = dateFormatter.format(new Date());

  return (
    <section className='relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-brand-400 via-brand-500 to-brand-600 px-6 py-8 text-white shadow-xl shadow-brand-600/20 animate-fade-up sm:px-10 sm:py-12 dark:from-brand-600 dark:via-brand-700 dark:to-brand-900 dark:shadow-black/30'>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -left-24 -top-28 size-80 rounded-full bg-white/15 blur-3xl motion-safe:animate-drift' />
        <div className='absolute -bottom-36 right-[20%] size-96 rounded-full bg-brand-800/30 blur-3xl motion-safe:animate-drift [animation-delay:-8s]' />
        <div className='absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_65%)]' />
      </div>

      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        <div className='max-w-xl'>
          <p className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur-sm animate-fade-up [animation-delay:80ms]'>
            <CalendarDays className='size-3.5' />
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </p>

          <h1 className='mt-4 text-3xl font-bold leading-tight tracking-tight text-balance animate-fade-up [animation-delay:160ms] sm:text-4xl'>
            {firstName ? `Boas-vindas, ${firstName}!` : 'Boas-vindas!'}{' '}
            <span
              aria-hidden='true'
              className='inline-block origin-[70%_70%] motion-safe:animate-wave'
            >
              👋
            </span>
          </h1>

          <p className='mt-3 max-w-md text-base leading-relaxed text-pretty text-white/85 animate-fade-up [animation-delay:240ms]'>
            Que bom ter você por aqui! Acompanhe as informações da sua empresa e os resultados da
            sua equipe em um só lugar.
          </p>
        </div>

        {shortcuts.length > 0 && (
          <nav
            aria-label='Atalhos'
            className='flex flex-wrap gap-2 animate-fade-up [animation-delay:320ms] md:w-56 md:shrink-0 md:flex-col'
          >
            {shortcuts.map(({ label, href, icon: Icon }, index) => (
              <Button
                key={href}
                href={href}
                size='lg'
                className={cn(
                  SHORTCUT_CLASS,
                  index === 0 ? MAIN_SHORTCUT_CLASS : SECONDARY_SHORTCUT_CLASS,
                )}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
