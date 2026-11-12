import type { DefaultSession } from 'next-auth';

export type SessionCompany = {
  id: string;
  name: string;
  logo: string | null;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    } & DefaultSession['user'];
    accessToken: string;
    company: SessionCompany | null;
    companies: SessionCompany[];
    permissions: string[];
    isPlatformAdmin: boolean;
  }

  interface User {
    accessToken: string;
    accessTokenExpires: number;
    company: SessionCompany | null;
    companies: SessionCompany[];
    permissions: string[];
    isPlatformAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    accessToken: string;
    accessTokenExpires: number;
    company: SessionCompany | null;
    companies: SessionCompany[];
    permissions: string[];
    isPlatformAdmin?: boolean;
    sessionCheckedAt?: number;
  }
}
