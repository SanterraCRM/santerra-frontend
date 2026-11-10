import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import type { SessionCompany } from '@/types/next-auth';

import { ApiError, apiRequest, isApiErrorWithStatus } from './api';
import { LOGIN_ERRORS, type LoginErrorCode } from './auth-errors';

const SESSION_MAX_AGE_IN_SECONDS = 24 * 60 * 60;
const SESSION_REFRESH_INTERVAL_MS = 2 * 60 * 1000;
const SESSION_ENDED_ERROR = 'SESSION_ENDED';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  isPlatformAdmin: boolean;
};

type LoginResponse = {
  token: string;
  user: SessionUser;
  companies: SessionCompany[];
};

type SelectCompanyResponse = {
  token: string;
  company: SessionCompany;
  permissions: string[];
};

type SessionStateResponse = {
  user: SessionUser;
  companies: SessionCompany[];
  currentCompanyId: string | null;
  permissions: string[];
};

type CompanyAccess = {
  accessToken: string;
  accessTokenExpires: number;
  company: SessionCompany | null;
  permissions: string[];
};

function toLoginErrorCode(error: unknown, forbiddenCode: LoginErrorCode): LoginErrorCode {
  if (!(error instanceof ApiError)) {
    return LOGIN_ERRORS.UNKNOWN;
  }

  if (error.status === 0) {
    return LOGIN_ERRORS.SERVICE_UNAVAILABLE;
  }

  if (error.status === 400 || error.status === 401) {
    return LOGIN_ERRORS.INVALID_CREDENTIALS;
  }

  if (error.status === 403) {
    return forbiddenCode;
  }

  return LOGIN_ERRORS.UNKNOWN;
}

function getTokenExpiration(accessToken: string): number {
  try {
    const [, payload] = accessToken.split('.');
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: unknown;
    };

    if (typeof exp === 'number') {
      return exp * 1000;
    }
  } catch {}

  return Date.now() + SESSION_MAX_AGE_IN_SECONDS * 1000;
}

async function selectCompany(accessToken: string, companyId: string): Promise<CompanyAccess> {
  const selection = await apiRequest<SelectCompanyResponse>('/auth/select-company', {
    method: 'POST',
    body: { companyId },
    token: accessToken,
  });

  return {
    accessToken: selection.token,
    accessTokenExpires: getTokenExpiration(selection.token),
    company: selection.company,
    permissions: selection.permissions,
  };
}

async function fetchSessionState(accessToken: string): Promise<SessionStateResponse | null> {
  try {
    return await apiRequest<SessionStateResponse>('/auth/me', { token: accessToken });
  } catch (error) {
    if (isApiErrorWithStatus(error, 401)) {
      throw new Error(SESSION_ENDED_ERROR);
    }

    return null;
  }
}

function applySessionState(token: JWT, state: SessionStateResponse): void {
  token.name = state.user.name;
  token.email = state.user.email;
  token.isPlatformAdmin = state.user.isPlatformAdmin;
  token.companies = state.companies;
  token.company = state.companies.find((company) => company.id === state.currentCompanyId) ?? null;
  token.permissions = state.permissions;
  token.sessionCheckedAt = Date.now();
}

function isSessionStale(token: JWT): boolean {
  return Date.now() - (token.sessionCheckedAt ?? 0) >= SESSION_REFRESH_INTERVAL_MS;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_IN_SECONDS,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  logger: {
    error(code, metadata) {
      if (metadata instanceof Error && metadata.message === SESSION_ENDED_ERROR) {
        return;
      }

      console.error(`[next-auth][error][${code}]`, metadata);
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
        companyId: { label: 'Empresa', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error(LOGIN_ERRORS.INVALID_CREDENTIALS);
        }

        const login = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: { email: credentials.email, password: credentials.password },
        }).catch((error: unknown) => {
          throw new Error(toLoginErrorCode(error, LOGIN_ERRORS.INACTIVE_USER));
        });

        const preferredCompany = login.companies.find(
          (company) => company.id === credentials.companyId,
        );
        const companyToSelect =
          preferredCompany ?? (login.companies.length === 1 ? login.companies[0] : null);
        const access = companyToSelect
          ? await selectCompany(login.token, companyToSelect.id).catch((error: unknown) => {
              throw new Error(toLoginErrorCode(error, LOGIN_ERRORS.NO_COMPANY));
            })
          : {
                accessToken: login.token,
                accessTokenExpires: getTokenExpiration(login.token),
                company: null,
                permissions: [],
              };

        return {
          id: login.user.id,
          name: login.user.name,
          email: login.user.email,
          isPlatformAdmin: login.user.isPlatformAdmin,
          companies: login.companies,
          ...access,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.accessToken = user.accessToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.company = user.company;
        token.companies = user.companies;
        token.permissions = user.permissions;
        token.isPlatformAdmin = user.isPlatformAdmin;
        token.sessionCheckedAt = Date.now();

        return token;
      }

      if (trigger === 'update' && typeof session?.companyId === 'string') {
        const access = await selectCompany(token.accessToken, session.companyId).catch(() => null);

        if (access) {
          Object.assign(token, access);
        }
      }

      if (trigger === 'update' || isSessionStale(token)) {
        const state = await fetchSessionState(token.accessToken);

        if (state) {
          applySessionState(token, state);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        name: token.name ?? '',
        email: token.email ?? '',
      };
      session.accessToken = token.accessToken;
      session.company = token.company;
      session.companies = token.companies;
      session.permissions = token.permissions;
      session.isPlatformAdmin = token.isPlatformAdmin ?? false;

      return session;
    },
  },
};
