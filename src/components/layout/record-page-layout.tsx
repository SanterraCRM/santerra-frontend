import type { ReactNode } from 'react';

import { BackLink } from './back-link';
import { PageHeader, type PageHeaderProps } from './page-header';

type RecordPageLayoutProps = Omit<PageHeaderProps, 'searchPlaceholder' | 'filters'> & {
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function RecordPageLayout({
  backHref,
  backLabel,
  children,
  ...header
}: RecordPageLayoutProps) {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      {backHref && backLabel && <BackLink href={backHref}>{backLabel}</BackLink>}
      <PageHeader {...header} />
      {children}
    </div>
  );
}
