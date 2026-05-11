import { NextResponse } from 'next/server';
import { PublicKeyAlgorithmId } from '@/types/crypto';
import { relayPublicKeyCiphertext } from '@/services/asymmetric-encryption.service';

export const runtime = 'nodejs';

interface RelayRequestBody {
  algorithm?: unknown;
  ciphertext?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: RelayRequestBody = await request.json();
    const { algorithm, ciphertext } = body;

    if (algorithm !== 'RSA-OAEP' || typeof ciphertext !== 'string') {
      return NextResponse.json({ error: 'Invalid public-key relay payload' }, { status: 400 });
    }

    const result = relayPublicKeyCiphertext(algorithm as PublicKeyAlgorithmId, ciphertext);

    return NextResponse.json({
      algorithm: result.algorithm,
      ciphertext: result.ciphertext,
      serverCanDecrypt: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Public-key relay failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
