import { NextResponse } from 'next/server';
import { HashingAlgorithmId } from '@/types/crypto';
import { verifyInput } from '@/services/hashing.service';

export const runtime = 'nodejs';

interface VerifyRequestBody {
  algorithm?: unknown;
  input?: unknown;
}

export async function POST(request: Request) {
  try {
    const body: VerifyRequestBody = await request.json();
    const { algorithm, input } = body;

    if (typeof algorithm !== 'string' || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const result = await verifyInput(algorithm as HashingAlgorithmId, input);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
