import { NextResponse } from 'next/server';
import { BrowserE2EAlgorithmId, BrowserE2ERelayPayload, BrowserE2ERelayResponse } from '@/types/crypto';

export const runtime = 'nodejs';

interface E2ERelayRequestBody {
  algorithm?: unknown;
  ciphertext?: unknown;
  iv?: unknown;
}

let lastRelayedPayload: BrowserE2ERelayPayload | null = null;

export async function POST(request: Request) {
  try {
    const body: E2ERelayRequestBody = await request.json();
    const { algorithm, ciphertext, iv } = body;

    if (algorithm !== 'AES-GCM' || typeof ciphertext !== 'string' || typeof iv !== 'string') {
      return NextResponse.json({ error: 'Invalid E2E relay payload' }, { status: 400 });
    }

    lastRelayedPayload = {
      algorithm: algorithm as BrowserE2EAlgorithmId,
      ciphertext,
      iv,
    };

    const response: BrowserE2ERelayResponse = {
      ...lastRelayedPayload,
      serverCanDecrypt: false,
    };

    console.log('CLIENT SENT CIPHERTEXT:', ciphertext);
    console.log('SERVER RECEIVED CIPHERTEXT:', ciphertext);
    console.log('SERVER DOES NOT HAVE KEY');
    console.log('SERVER CANNOT DECRYPT MESSAGE');
    console.log('SERVER STORED ENCRYPTED VALUE:', ciphertext);
    console.log('SERVER RELAYED CIPHERTEXT TO BOB');

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'E2E relay failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
