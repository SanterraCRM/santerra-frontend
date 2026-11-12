import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import { formatCurrency, formatPercent } from '@/lib/format';
import type { FilterDefinition, FilterOption } from '@/lib/list-filters';
import type { ProductRelation } from '@/types/product';

export const PRODUCTS_HREF = '/admin/products';

function toFilterOptions(relations: ProductRelation[]): FilterOption[] {
  return relations.map(({ id, name }) => ({ value: id, label: name }));
}

export function getProductFilters(
  manufacturers: ProductRelation[],
  groups: ProductRelation[] | null,
): FilterDefinition[] {
  const filters: FilterDefinition[] = [];

  if (manufacturers.length > 0) {
    filters.push({
      type: 'select',
      key: 'manufacturerId',
      label: 'Fabricante',
      options: toFilterOptions(manufacturers),
    });
  }

  if (groups && groups.length > 0) {
    filters.push({ type: 'select', key: 'groupId', label: 'Grupo', options: toFilterOptions(groups) });
  }

  filters.push(
    { type: 'moneyRange', label: 'Preço de venda', fromKey: 'priceMin', toKey: 'priceMax' },
    { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
  );

  return filters;
}

export const PRODUCT_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum produto encontrado',
  filtersDescription: 'Nenhum produto corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho da descrição.',
  emptyTitle: 'Nenhum produto cadastrado',
  emptyDescription: 'Cadastre o primeiro produto do catálogo da empresa.',
  emptyReadOnlyDescription: 'Quando houver produtos cadastrados, eles aparecerão aqui.',
};

export const PRODUCT_DELETE_TEXTS: DeleteDialogTexts = {
  description: 'O produto sai do catálogo da empresa. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir produto',
  successMessage: 'Produto excluído.',
  errorMessage: 'Não foi possível excluir o produto. Tente novamente.',
};

export function formatMargin(price: number | null, costPrice: number | null): string | null {
  if (price === null || costPrice === null) {
    return null;
  }

  const priceCents = Math.round(price * 100);
  const marginCents = priceCents - Math.round(costPrice * 100);
  const margin = formatCurrency(marginCents / 100);

  if (priceCents === 0) {
    return margin;
  }

  return `${margin} (${formatPercent(marginCents / priceCents)} do preço de venda)`;
}
