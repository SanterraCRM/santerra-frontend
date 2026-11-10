const BYTES_PER_MEGABYTE = 1024 * 1024;
const FILE_MAX_SIZE_MB = 10;

export const FILE_MAX_SIZE = FILE_MAX_SIZE_MB * BYTES_PER_MEGABYTE;

const FILE_EXTENSIONS_BY_TYPE: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

const SPREADSHEET_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ACCEPTED_FILES = Object.entries(FILE_EXTENSIONS_BY_TYPE)
  .flatMap(([type, extensions]) => [type, ...extensions])
  .join(',');

export const ACCEPTED_FILES_HINT = `PDF, imagem, texto, planilha, documento ou apresentação, até ${FILE_MAX_SIZE_MB} MB.`;

export function getFileValidationError(file: File): string | null {
  if (!(file.type in FILE_EXTENSIONS_BY_TYPE)) {
    return 'Tipo de arquivo não permitido. Envie PDF, imagem (JPG, PNG, WEBP, GIF), texto, CSV, documento, planilha ou apresentação.';
  }

  if (file.size === 0) {
    return 'O arquivo enviado está vazio.';
  }

  if (file.size > FILE_MAX_SIZE) {
    return `O arquivo excede o tamanho máximo de ${FILE_MAX_SIZE_MB} MB.`;
  }

  return null;
}

export function getFileUrl(id: string): string {
  return `/api/files/${id}`;
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isSpreadsheetFile(mimeType: string): boolean {
  return SPREADSHEET_TYPES.includes(mimeType);
}
