import { NextResponse } from 'next/server';
import { BackendEncryptionAlgorithmId } from '@/constants/algorithms';
import {
  decryptBackendMessage,
  getStoredBackendRecord,
} from '@/services/backend-encryption.service';

export const runtime = 'nodejs';

interface BackendEncryptionDecryptRequestBody {
  algorithm?: unknown;
  encrypted?: unknown;
  iv?: unknown;
  authTag?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: BackendEncryptionDecryptRequestBody = await request.json();
    const { algorithm, encrypted, iv, authTag } = body;

    if (typeof algorithm !== 'string' || typeof encrypted !== 'string' || typeof iv !== 'string') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const storedRecord = getStoredBackendRecord();
    const requestPayload = {
      algorithm: algorithm as BackendEncryptionAlgorithmId,
      encrypted,
      iv,
      authTag: typeof authTag === 'string' ? authTag : undefined,
    };

    if (
      storedRecord &&
      (storedRecord.algorithm !== algorithm ||
        storedRecord.encrypted !== encrypted ||
        storedRecord.iv !== iv ||
        (storedRecord.authTag ?? undefined) !== (typeof authTag === 'string' ? authTag : undefined))
    ) {
      return NextResponse.json(
        { error: 'Stored encrypted value does not match the provided payload' },
        { status: 409 },
      );
    }

    const decrypted = decryptBackendMessage(storedRecord ?? requestPayload);
    return NextResponse.json(decrypted);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Decryption failed';
    console.error('Backend decryption error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
