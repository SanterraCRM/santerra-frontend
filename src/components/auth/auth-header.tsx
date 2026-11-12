import type { ReactNode } from 'react';

type AuthHeaderProps = {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
};

export function AuthHeader({ title, description, icon }: AuthHeaderProps) {
  return (
    <div className='mb-8 animate-fade-up'>
      {icon && (
        <div className='mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100'>
          {icon}
        </div>
      )}
      <h1 className='text-[28px] font-bold leading-tight tracking-tight text-slate-900'>{title}</h1>
      <p className='mt-2 text-[15px] leading-relaxed text-slate-500'>{description}</p>
    </div>
  );
}
