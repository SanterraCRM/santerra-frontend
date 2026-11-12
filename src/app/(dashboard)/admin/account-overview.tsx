import { Building2, Layers, type LucideIcon, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

import { CompanyLogo } from '@/components/layout/company-logo';
import type { SessionCompany } from '@/types/next-auth';

type OverviewItem = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  media?: ReactNode;
};

type AccountOverviewProps = {
  userName: string;
  email: string;
  company: SessionCompany | null;
  companyCount: number;
};

export default function AccountOverview({
  userName,
  email,
  company,
  companyCount,
}: AccountOverviewProps) {
  const items: OverviewItem[] = [
    {
      label: 'Empresa atual',
      value: company?.name ?? '',
      description: 'As informações do painel são desta empresa.',
      icon: Building2,
      media: company?.logo && (
        <CompanyLogo
          company={company}
          className='size-10 rounded-xl transition-transform duration-200 after:rounded-xl group-hover:scale-110'
        />
      ),
    },
    {
      label: 'Sua conta',
      value: userName,
      description: email,
      icon: UserRound,
    },
    {
      label: 'Empresas vinculadas',
      value: companyCount === 1 ? '1 empresa' : `${companyCount} empresas`,
      description:
        companyCount > 1
          ? 'Troque de empresa pelo menu da sua conta, no canto superior.'
          : 'Sua conta tem acesso a esta empresa.',
      icon: Layers,
    },
  ];

  return (
    <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map(({ label, value, description, icon: Icon, media }, index) => (
        <li
          key={label}
          style={{ animationDelay: `${320 + index * 80}ms` }}
          className='group min-w-0 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 animate-fade-up hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/10 dark:hover:border-brand-800'
        >
          <div className='flex items-center gap-3'>
            {media || (
              <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-transform duration-200 group-hover:scale-110 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-900'>
                <Icon className='size-5' />
              </span>
            )}
            <p className='text-sm font-medium text-muted-foreground'>{label}</p>
          </div>

          <p className='mt-4 truncate text-lg font-semibold tracking-tight'>{value}</p>
          <p className='mt-1 text-sm leading-relaxed text-pretty wrap-anywhere text-muted-foreground'>
            {description}
          </p>
        </li>
      ))}
    </ul>
  );
}
