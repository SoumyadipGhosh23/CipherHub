import { NextResponse } from 'next/server';
import { encryptBackendMessage } from '@/services/backend-encryption.service';
import { BackendEncryptionAlgorithmId } from '@/constants/algorithms';

export const runtime = 'nodejs';

interface BackendEncryptionRequestBody {
  message?: unknown;
  algorithm?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: BackendEncryptionRequestBody = await request.json();
    const { message, algorithm } = body;

    if (typeof message !== 'string' || typeof algorithm !== 'string') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const result = encryptBackendMessage({
      message,
      algorithm: algorithm as BackendEncryptionAlgorithmId,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Encryption failed';
    console.error('Backend encryption error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
