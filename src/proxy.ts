import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';

const LOGIN_PATH = '/auth/login';
const SIGN_UP_PATH = '/auth/sign-up';
const SELECT_COMPANY_PATH = '/auth/select-company';
const CREATE_COMPANY_PATH = '/auth/create-company';
const PLATFORM_PATH = '/admin/platform';

function isPlatformPath(pathname: string): boolean {
  return pathname === PLATFORM_PATH || pathname.startsWith(`${PLATFORM_PATH}/`);
}

function redirectWithCallback(request: NextRequest, path: string) {
  const { pathname, search } = request.nextUrl;
  const url = new URL(path, request.url);

  if (pathname !== '/') {
    url.searchParams.set('callbackUrl', `${pathname}${search}`);
  }

  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }).catch(
    () => null,
  );
  const isAuthenticated =
    Boolean(token?.accessToken) &&
    typeof token?.accessTokenExpires === 'number' &&
    token.accessTokenExpires > Date.now();
  const hasCompany = Boolean(token?.company);

  if (pathname.startsWith('/auth')) {
    if ((pathname === LOGIN_PATH || pathname === SIGN_UP_PATH) && isAuthenticated) {
      return NextResponse.redirect(
        new URL(hasCompany ? DEFAULT_CALLBACK_URL : SELECT_COMPANY_PATH, request.url),
      );
    }

    if ((pathname === SELECT_COMPANY_PATH || pathname === CREATE_COMPANY_PATH) && !isAuthenticated) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return redirectWithCallback(request, LOGIN_PATH);
  }

  if (!hasCompany && !(token?.isPlatformAdmin === true && isPlatformPath(pathname))) {
    return redirectWithCallback(request, SELECT_COMPANY_PATH);
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(DEFAULT_CALLBACK_URL, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/auth/:path*'],
};
