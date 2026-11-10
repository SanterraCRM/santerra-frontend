import { getServerSession } from 'next-auth';

import { API_URL } from '@/lib/api';
import { authOptions } from '@/lib/auth';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FORWARDED_HEADERS = ['content-type', 'content-length', 'content-disposition'];

type FileRouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

export async function GET(_request: Request, { params }: FileRouteContext): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return errorResponse(401, 'UNAUTHORIZED', 'Sua sessão terminou. Entre novamente.');
  }

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return errorResponse(404, 'RESOURCE_NOT_FOUND', 'Arquivo não encontrado.');
  }

  const upstream = await fetch(`${API_URL}/files/${id}/download`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: 'no-store',
  }).catch(() => null);

  if (!upstream) {
    return errorResponse(502, 'NETWORK_ERROR', 'Não foi possível conectar ao servidor.');
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }

  const headers = new Headers({
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff',
  });

  FORWARDED_HEADERS.forEach((name) => {
    const value = upstream.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  });

  return new Response(upstream.body, { status: 200, headers });
}
