export const DEFAULT_CALLBACK_URL = '/admin';

export const SESSION_ENDED_PATH = '/auth/session-ended';

export const SELECT_COMPANY_PATH = '/auth/select-company';

export function getSafeCallbackUrl(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\') ||
    value.startsWith('/auth')
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  return value;
}
