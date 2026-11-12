import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';

export const PLATFORM_COMPANIES_HREF = '/admin/platform/companies';

export const PLATFORM_COMPANY_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma empresa encontrada',
  filtersDescription: 'Nenhuma empresa corresponde aos filtros aplicados.',
  searchHint: 'Busque pelo nome ou por um trecho da descrição.',
  emptyTitle: 'Nenhuma empresa cadastrada',
  emptyDescription: 'Crie a primeira empresa, já com o dono que vai administrá-la.',
  emptyReadOnlyDescription: 'Quando houver empresas cadastradas, elas aparecerão aqui.',
};

export function formatMembersCount(count: number): string {
  if (count === 0) {
    return 'Nenhum membro';
  }

  return count === 1 ? '1 membro' : `${count} membros`;
}
