import { CalendarDays } from 'lucide-react';
import Image from 'next/image';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Sao_Paulo',
});

type WelcomeBannerProps = {
  firstName: string;
};

export default function WelcomeBanner({ firstName }: WelcomeBannerProps) {
  const today = dateFormatter.format(new Date());

  return (
    <section className='relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-brand-400 via-brand-500 to-brand-600 px-6 py-8 text-white shadow-xl shadow-brand-600/20 animate-fade-up sm:px-10 sm:py-12 dark:from-brand-600 dark:via-brand-700 dark:to-brand-900 dark:shadow-black/30'>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -left-24 -top-28 size-80 rounded-full bg-white/15 blur-3xl motion-safe:animate-drift' />
        <div className='absolute -bottom-36 right-[20%] size-96 rounded-full bg-brand-800/30 blur-3xl motion-safe:animate-drift [animation-delay:-8s]' />
        <div className='absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_65%)]' />
      </div>

      <div className='flex flex-col-reverse gap-8 md:flex-row md:items-center md:justify-between'>
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

        <div className='relative flex size-24 shrink-0 items-center justify-center animate-fade-up [animation-delay:120ms] sm:size-32 md:size-44 lg:size-52'>
          <div className='absolute inset-0 rounded-full border border-dashed border-white/35 motion-safe:animate-orbit'>
            <span className='absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.7)]' />
          </div>
          <div className='absolute inset-2.5 rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm md:inset-4' />
          <Image
            src='/logo-mark-white.png'
            alt=''
            width={139}
            height={160}
            priority
            className='relative h-auto w-10 drop-shadow-[0_16px_24px_rgba(15,38,80,0.3)] motion-safe:animate-float sm:w-14 md:w-20 lg:w-24'
          />
        </div>
      </div>
    </section>
  );
}
