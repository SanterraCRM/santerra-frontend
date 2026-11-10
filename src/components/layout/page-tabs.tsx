'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

export type PageTab = {
  label: string;
  href: string;
};

type PageTabsProps = {
  label: string;
  tabs: PageTab[];
};

export function PageTabs({ label, tabs }: PageTabsProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className='-mt-2 border-b animate-fade-up [animation-delay:40ms]'>
      <ul className='-mb-px flex gap-6'>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 items-center border-b-2 border-transparent text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground',
                  isActive && 'border-primary text-foreground',
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
