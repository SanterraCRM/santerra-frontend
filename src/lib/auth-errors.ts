export const LOGIN_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INACTIVE_USER: 'INACTIVE_USER',
  NO_COMPANY: 'NO_COMPANY',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  SESSION_ENDED: 'SESSION_ENDED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type LoginErrorCode = (typeof LOGIN_ERRORS)[keyof typeof LOGIN_ERRORS];

const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos. Confira os dados e tente novamente.',
  INACTIVE_USER: 'Sua conta está desativada. Fale com o administrador da sua empresa.',
  NO_COMPANY:
    'Sua conta não está vinculada a nenhuma empresa ativa. Peça um convite ao administrador da sua empresa.',
  SERVICE_UNAVAILABLE: 'Não foi possível conectar ao servidor. Tente novamente em instantes.',
  SESSION_ENDED:
    'Sua sessão foi encerrada, porque o seu acesso mudou ou expirou. Entre novamente para continuar.',
  UNKNOWN: 'Não foi possível entrar agora. Tente novamente em instantes.',
};

export function getLoginErrorMessage(code?: string | null): string {
  if (code === 'CredentialsSignin') {
    return LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  if (code && Object.hasOwn(LOGIN_ERROR_MESSAGES, code)) {
    return LOGIN_ERROR_MESSAGES[code as LoginErrorCode];
  }

  return LOGIN_ERROR_MESSAGES.UNKNOWN;
}

export class LoginError extends Error {
  constructor(code?: string | null) {
    super(getLoginErrorMessage(code));
    this.name = 'LoginError';
  }
}
