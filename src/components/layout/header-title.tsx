'use client';

import { usePathname } from 'next/navigation';

import { isNavItemActive, NAV_ITEMS } from './nav-items';

export function HeaderTitle() {
  const pathname = usePathname();
  const currentItem = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));

  return <p className='truncate text-sm font-semibold text-foreground'>{currentItem?.title}</p>;
}
