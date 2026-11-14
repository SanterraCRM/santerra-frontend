import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';

export const COMPANY_DEACTIVATION_TEXTS = {
  title: 'Inativar empresa',
  description:
    'Encerra o acesso de toda a equipe. Só o dono pode inativar, com a própria senha, e só a administração da plataforma reativa.',
};

export const COMPANY_LOGO_REMOVE_TEXTS: DeleteDialogTexts = {
  title: 'Remover a logo?',
  description:
    'A empresa volta a aparecer com as iniciais do nome. Você pode enviar outra logo quando quiser.',
  confirmLabel: 'Remover logo',
  successMessage: 'Logo removida.',
  errorMessage: 'Não foi possível remover a logo agora. Tente novamente.',
};
