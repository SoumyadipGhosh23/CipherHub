import { NextResponse } from 'next/server';
import { transmitTlsPacket } from '@/services/tls.service';

export const runtime = 'nodejs';

interface TransmitRequestBody {
  sessionId?: unknown;
  ciphertext?: unknown;
  iv?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: TransmitRequestBody = await request.json();
    const { sessionId, ciphertext, iv } = body;

    if (typeof sessionId !== 'string' || typeof ciphertext !== 'string' || typeof iv !== 'string') {
      return NextResponse.json({ error: 'Invalid TLS transmit payload' }, { status: 400 });
    }

    const result = transmitTlsPacket(sessionId, ciphertext, iv);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TLS transmit failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
