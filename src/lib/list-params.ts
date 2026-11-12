export const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;
export const DEFAULT_PAGE_SIZE: number = PAGE_SIZE_OPTIONS[0];

export type SearchParams = { [key: string]: string | string[] | undefined };

export function getSearchParam(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];

  return typeof value === 'string' ? value.trim() : '';
}

export function parseListParams(searchParams: SearchParams) {
  const pageSize = Number(getSearchParam(searchParams, 'limit'));

  return {
    page: Math.max(1, Math.trunc(Number(getSearchParam(searchParams, 'page'))) || 1),
    pageSize: PAGE_SIZE_OPTIONS.find((option) => option === pageSize) ?? DEFAULT_PAGE_SIZE,
    search: getSearchParam(searchParams, 'search'),
  };
}

export function buildApiListQuery(
  { page, pageSize, search }: ReturnType<typeof parseListParams>,
  filters: Record<string, string> = {},
): URLSearchParams {
  const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });

  Object.entries({ search, ...filters }).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function toHref(pathname: string, params: URLSearchParams): string {
  return params.size ? `${pathname}?${params}` : pathname;
}

export function buildListHref(
  pathname: string,
  query: Record<string, string>,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): string {
  const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== ''));

  if (pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('limit', String(pageSize));
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return toHref(pathname, params);
}
