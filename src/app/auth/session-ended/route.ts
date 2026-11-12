import { type NextRequest, NextResponse } from 'next/server';

import { LOGIN_ERRORS } from '@/lib/auth-errors';

const SESSION_COOKIE_PATTERN = /^(__Secure-)?next-auth\.session-token(\.\d+)?$/;

export function GET(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('error', LOGIN_ERRORS.SESSION_ENDED);

  const response = NextResponse.redirect(loginUrl);

  for (const { name } of request.cookies.getAll()) {
    if (SESSION_COOKIE_PATTERN.test(name)) {
      response.cookies.set(name, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: name.startsWith('__Secure-'),
      });
    }
  }

  return response;
}
