import { NextResponse } from 'next/server';
import { TlsVersionId } from '@/types/crypto';
import { startTlsHandshake } from '@/services/tls.service';

export const runtime = 'nodejs';

interface HandshakeRequestBody {
  version?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: HandshakeRequestBody = await request.json();
    const { version } = body;

    if (version !== 'TLS 1.2' && version !== 'TLS 1.3') {
      return NextResponse.json({ error: 'Invalid TLS version' }, { status: 400 });
    }

    const result = startTlsHandshake(version as TlsVersionId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TLS handshake failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
