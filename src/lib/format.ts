const TIME_ZONE = 'America/Sao_Paulo';
const TIME_ZONE_OFFSET = '-03:00';
const DECIMAL_INTEGER_DIGITS = 10;
const DECIMAL_FRACTION_DIGITS = 2;

const dateFormatters = {
  short: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: TIME_ZONE }),
  long: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: TIME_ZONE }),
};

const dateInputFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: TIME_ZONE,
});

const MONEY_MAX_DIGITS = 14;

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: DECIMAL_FRACTION_DIGITS,
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const fileSizeFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function maskMoney(value: string): string {
  const digits = onlyDigits(value).replace(/^0+/, '').slice(0, MONEY_MAX_DIGITS);

  if (!digits) {
    return '';
  }

  const cents = digits.padStart(3, '0');
  const integer = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${integer},${cents.slice(-2)}`;
}

export function parseMoney(value: string): number | null {
  const digits = onlyDigits(value);

  return digits ? Number((Number(digits) / 100).toFixed(2)) : null;
}

export function toMoneyInputValue(value: number): string {
  return maskMoney(value.toFixed(2));
}

export function toMoneyParam(value: string): string {
  return parseMoney(value)?.toFixed(2) ?? '';
}

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${fileSizeFormatter.format(bytes / 1024)} KB`;
  }

  return `${fileSizeFormatter.format(bytes / (1024 * 1024))} MB`;
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

export function maskDecimal(value: string): string {
  const normalized = value.includes(',') ? value.replace(/\./g, '') : value.replace(/\./g, ',');
  const [integer, ...fraction] = normalized.replace(/[^\d,]/g, '').split(',');
  const integerDigits = integer.replace(/^0+(?=\d)/, '').slice(0, DECIMAL_INTEGER_DIGITS);

  if (fraction.length === 0) {
    return integerDigits;
  }

  return `${integerDigits || '0'},${fraction.join('').slice(0, DECIMAL_FRACTION_DIGITS)}`;
}

export function parseDecimal(value: string): number | null {
  return value ? Number(value.replace(',', '.')) : null;
}

export function normalizeDocumentSearch(term: string): string {
  return /^[\d\s./-]+$/.test(term) ? onlyDigits(term) : term;
}

export function formatDate(
  value: string | Date,
  style: keyof typeof dateFormatters = 'short',
): string {
  return dateFormatters[style].format(new Date(value));
}

export function toDayBoundary(date: string, boundary: 'start' | 'end'): string {
  const time = boundary === 'start' ? '00:00:00.000' : '23:59:59.999';

  return `${date}T${time}${TIME_ZONE_OFFSET}`;
}

export function toDateInputValue(value: string): string {
  return dateInputFormatter.format(new Date(value));
}

function applyMask(digits: string, groups: number[], separators: string[]): string {
  let masked = '';
  let start = 0;

  groups.forEach((size, index) => {
    const part = digits.slice(start, start + size);

    if (part) {
      masked += (index > 0 ? separators[index - 1] : '') + part;
    }

    start += size;
  });

  return masked;
}

export function maskCnpj(value: string): string {
  return applyMask(onlyDigits(value).slice(0, 14), [2, 3, 3, 4, 2], ['.', '.', '/', '-']);
}

export function maskNationalId(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  return digits.length <= 11 ? applyMask(digits, [3, 3, 3, 2], ['.', '.', '-']) : maskCnpj(digits);
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (!digits) {
    return '';
  }

  return `(${applyMask(digits, [2, digits.length > 10 ? 5 : 4, 4], [') ', '-'])}`;
}

export function formatNationalId(value: string): string {
  return [11, 14].includes(onlyDigits(value).length) ? maskNationalId(value) : value;
}

export function formatPhone(value: string): string {
  return [10, 11].includes(onlyDigits(value).length) ? maskPhone(value) : value;
}
