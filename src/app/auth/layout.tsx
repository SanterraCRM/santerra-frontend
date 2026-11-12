import Image from 'next/image';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex min-h-screen bg-white'>
      <aside className='relative hidden overflow-hidden bg-linear-to-br from-brand-400 via-brand-500 to-brand-600 p-12 text-white lg:flex lg:w-[46%] lg:flex-col lg:justify-between xl:w-1/2 xl:p-16'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
          <div className='absolute -left-32 -top-32 size-[28rem] rounded-full bg-white/10 blur-3xl' />
          <div className='absolute -bottom-40 -right-32 size-[34rem] rounded-full bg-brand-700/30 blur-3xl' />
          <div className='absolute right-[12%] top-[18%] size-40 rounded-full border border-white/15' />
          <div className='absolute bottom-[22%] left-[10%] size-24 rounded-full border border-white/10' />
          <div className='absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]' />
        </div>

        <div className='relative flex items-center gap-3'>
          <Image
            src='/logo.png'
            alt=''
            width={44}
            height={44}
            className='rounded-full shadow-lg shadow-brand-900/20 ring-2 ring-white/70'
          />
          <span className='text-xl font-bold tracking-tight'>WebUp!</span>
        </div>

        <div className='relative flex flex-col items-center text-center'>
          <div className='flex size-64 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm xl:size-72'>
            <Image
              src='/logo-mark-white.png'
              alt=''
              width={139}
              height={160}
              priority
              className='drop-shadow-[0_24px_32px_rgba(15,38,80,0.28)] motion-safe:animate-float'
            />
          </div>

          <h2 className='mt-12 max-w-md text-balance text-3xl font-bold leading-tight xl:text-[34px]'>
            Mais performance e organização com os nossos sistemas.
          </h2>
          <p className='mt-4 max-w-sm text-balance text-base leading-relaxed text-white/85'>
            Centralize informações, automatize rotinas e acompanhe os resultados da sua equipe em
            um só lugar.
          </p>
        </div>

        <p className='relative text-sm text-white/75'>
          © {new Date().getFullYear()} WebUp! Todos os direitos reservados.
        </p>
      </aside>

      <main className='flex flex-1 flex-col items-center justify-center bg-linear-to-b from-brand-50 via-white to-white px-6 py-12 sm:px-12'>
        <div className='w-full max-w-[400px]'>
          <div className='mb-10 flex items-center justify-center gap-3 lg:hidden'>
            <Image src='/logo.png' alt='' width={48} height={48} priority />
            <span className='text-2xl font-bold tracking-tight text-slate-900'>WebUp!</span>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
