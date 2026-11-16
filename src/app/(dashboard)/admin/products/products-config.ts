import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import { formatCurrency, formatDecimal, formatPercent } from '@/lib/format';
import type { FilterDefinition, FilterOption } from '@/lib/list-filters';
import type { ProductView, ProductViewFilterOptions } from '@/types/product';

export const PRODUCTS_HREF = '/admin/products';

const ACTIVE_FLAG = 1;

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'true', label: 'Ativos' },
  { value: 'false', label: 'Inativos' },
];

function toFilterOptions(values: string[]): FilterOption[] {
  return values.map((value) => ({ value, label: value }));
}

export function getProductFilters(options: ProductViewFilterOptions): FilterDefinition[] {
  const selects: { key: string; label: string; options: FilterOption[] }[] = [
    {
      key: 'manufacturerId',
      label: 'Fabricante',
      options: options.manufacturers.map(({ id, name }) => ({ value: id, label: name })),
    },
    { key: 'crop', label: 'Cultura', options: toFilterOptions(options.crops) },
    { key: 'department', label: 'Departamento', options: toFilterOptions(options.departments) },
    { key: 'section', label: 'Seção', options: toFilterOptions(options.sections) },
    { key: 'category', label: 'Categoria', options: toFilterOptions(options.categories) },
    { key: 'line', label: 'Linha', options: toFilterOptions(options.lines) },
  ];

  return [
    { type: 'select', key: 'isActive', label: 'Situação', options: STATUS_OPTIONS },
    ...selects
      .filter((filter) => filter.options.length > 0)
      .map((filter) => ({ type: 'select' as const, ...filter })),
  ];
}

// A view usa código numérico e pode trazer linhas sem código; as listas trabalham com id string.
export type ProductViewRow = Omit<ProductView, 'id'> & { id: string };

export function toProductViewRows(products: ProductView[]): ProductViewRow[] {
  return products.flatMap(({ id, ...product }) =>
    id === null ? [] : [{ ...product, id: String(id) }],
  );
}

export function isProductActive(product: Pick<ProductView, 'isActive'>): boolean {
  return product.isActive === ACTIVE_FLAG;
}

export function getProductName(product: Pick<ProductView, 'product'>): string {
  return product.product?.trim() || 'Produto sem nome';
}

export function formatProductClassification(
  product: Pick<ProductView, 'department' | 'section' | 'category' | 'line'>,
): string | null {
  const parts = [product.department, product.section, product.category, product.line].filter(
    (part): part is string => Boolean(part?.trim()),
  );

  return parts.length > 0 ? parts.join(' › ') : null;
}

export function formatMeasure(value: number | null, unit?: string): string | null {
  if (value === null) {
    return null;
  }

  return unit ? `${formatDecimal(value)} ${unit}` : formatDecimal(value);
}

export const PRODUCT_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhum produto encontrado',
  filtersDescription: 'Nenhum produto corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque por um trecho do nome.',
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
