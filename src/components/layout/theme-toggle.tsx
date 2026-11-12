'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className='rounded-full text-muted-foreground hover:text-foreground'
        >
          <Moon className='size-5 duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:spin-in-90 motion-safe:zoom-in-50 dark:hidden' />
          <Sun className='hidden size-5 duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:spin-in-90 motion-safe:zoom-in-50 dark:block' />
          <span className='sr-only'>Alternar tema</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span className='dark:hidden'>Ativar modo escuro</span>
        <span className='hidden dark:inline'>Ativar modo claro</span>
      </TooltipContent>
    </Tooltip>
  );
}
