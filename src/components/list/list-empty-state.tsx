import { type LucideIcon, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export type ListEmptyStateTexts = {
  notFoundTitle: string;
  filtersDescription: string;
  searchHint?: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyReadOnlyDescription: string;
};

type ListEmptyStateProps = {
  icon: LucideIcon;
  pathname: string;
  searchTerm: string;
  hasFilters: boolean;
  texts: ListEmptyStateTexts;
  createAction?: ReactNode;
};

function getClearLabel(searchTerm: string, hasFilters: boolean): string {
  if (searchTerm && hasFilters) {
    return 'Limpar busca e filtros';
  }

  return searchTerm ? 'Limpar busca' : 'Limpar filtros';
}

export function ListEmptyState({
  icon: Icon,
  pathname,
  searchTerm,
  hasFilters,
  texts,
  createAction,
}: ListEmptyStateProps) {
  if (searchTerm || hasFilters) {
    return (
      <Empty className='border bg-card animate-fade-up [animation-delay:80ms]'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>{texts.notFoundTitle}</EmptyTitle>
          <EmptyDescription>
            {searchTerm
              ? `Não encontramos resultados para “${searchTerm}”${hasFilters ? ' com os filtros aplicados' : ''}. ${texts.searchHint ?? 'Confira a grafia.'}`
              : `${texts.filtersDescription} Ajuste ou limpe os filtros.`}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button href={pathname} variant='outline'>
            {getClearLabel(searchTerm, hasFilters)}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className='border bg-card animate-fade-up [animation-delay:80ms]'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{texts.emptyTitle}</EmptyTitle>
        <EmptyDescription>
          {createAction ? texts.emptyDescription : texts.emptyReadOnlyDescription}
        </EmptyDescription>
      </EmptyHeader>
      {createAction && <EmptyContent>{createAction}</EmptyContent>}
    </Empty>
  );
}
