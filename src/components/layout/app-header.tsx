import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { HeaderTitle } from './header-title';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

type AppHeaderProps = {
  userName: string;
  email: string;
  companyName: string;
  canSwitchCompany: boolean;
};

export function AppHeader({ userName, email, companyName, canSwitchCompany }: AppHeaderProps) {
  return (
    <header className='sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 md:rounded-t-xl'>
      <SidebarTrigger className='-ml-1 text-muted-foreground hover:text-foreground' />
      <Separator orientation='vertical' className='data-vertical:h-5 data-vertical:self-center' />
      <HeaderTitle />

      <div className='ml-auto flex items-center gap-2'>
        <ThemeToggle />
        <UserMenu
          userName={userName}
          email={email}
          companyName={companyName}
          canSwitchCompany={canSwitchCompany}
        />
      </div>
    </header>
  );
}
