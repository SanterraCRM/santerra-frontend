'use client';

import { ChevronsUpDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

import { Combobox } from '@/components/form/combobox';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useSelectCompany } from '@/hooks/auth/use-select-company';
import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';
import type { SessionCompany } from '@/types/next-auth';

import { CompanyLogo } from './company-logo';

type CompanySwitcherProps = {
  companies: SessionCompany[];
  currentCompanyId: string | null;
  side: 'bottom' | 'right';
  className: string;
  children: ReactNode;
};

export function CompanySwitcher({
  companies,
  currentCompanyId,
  side,
  className,
  children,
}: CompanySwitcherProps) {
  const { mutate: selectCompany } = useSelectCompany();
  const [isSwitching, setIsSwitching] = useState(false);
  const currentCompany = companies.find((company) => company.id === currentCompanyId);

  async function handleChange([companyId]: string[]) {
    if (!companyId || companyId === currentCompanyId) {
      return;
    }

    setIsSwitching(true);

    try {
      await selectCompany(companyId);
    } catch {
      setIsSwitching(false);
      toast.error('Não foi possível trocar de empresa agora. Tente novamente.');
      return;
    }

    window.location.assign(DEFAULT_CALLBACK_URL);
  }

  return (
    <Combobox
      options={companies.map((company) => ({
        value: company.id,
        label: company.name,
        icon: <CompanyLogo company={company} size='sm' />,
      }))}
      value={currentCompanyId ? [currentCompanyId] : []}
      onChange={handleChange}
      searchPlaceholder='Buscar empresa…'
      side={side}
      disabled={isSwitching}
      trigger={
        <SidebarMenuButton
          size='lg'
          aria-label={
            currentCompany
              ? `Trocar de empresa. Empresa atual: ${currentCompany.name}`
              : 'Trocar de empresa'
          }
          aria-busy={isSwitching || undefined}
          className={className}
        >
          {children}
          {isSwitching ? (
            <Spinner className='ml-auto text-muted-foreground' />
          ) : (
            <ChevronsUpDown className='ml-auto text-muted-foreground' />
          )}
        </SidebarMenuButton>
      }
    />
  );
}
