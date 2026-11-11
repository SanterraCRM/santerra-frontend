import { API_URL } from './api';

const BYTES_PER_MEGABYTE = 1024 * 1024;
const COMPANY_LOGO_MAX_SIZE_MB = 2;
const COMPANY_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const COMPANY_LOGO_ACCEPT = [...COMPANY_LOGO_TYPES, '.png', '.jpg', '.jpeg', '.webp'].join(',');

export const COMPANY_LOGO_HINT = `PNG, JPG ou WEBP, até ${COMPANY_LOGO_MAX_SIZE_MB} MB. Prefira uma imagem quadrada.`;

type CompanyWithLogo = {
  id: string;
  logo: string | null;
};

export function getCompanyLogoUrl({ id, logo }: CompanyWithLogo): string | null {
  return logo ? `${API_URL}/companies/${id}/logo?v=${encodeURIComponent(logo)}` : null;
}

export function getCompanyLogoValidationError(file: File): string | null {
  if (!COMPANY_LOGO_TYPES.includes(file.type)) {
    return 'Envie a logo em PNG, JPG ou WEBP.';
  }

  if (file.size === 0) {
    return 'O arquivo enviado está vazio.';
  }

  if (file.size > COMPANY_LOGO_MAX_SIZE_MB * BYTES_PER_MEGABYTE) {
    return `O arquivo excede o tamanho máximo de ${COMPANY_LOGO_MAX_SIZE_MB} MB.`;
  }

  return null;
}
