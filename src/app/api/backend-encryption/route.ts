import { NextResponse } from 'next/server';
import { encryptMessage } from '@/services/backend-encryption.service';
import { EncryptionResult } from '@/types/crypto';

export async function POST(request: Request) {
  try {
    const { message, algorithm } = await request.json();
    if (typeof message !== 'string' || typeof algorithm !== 'string') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    const result: EncryptionResult = await encryptMessage(message, algorithm);
    // Simulate storage (in-memory, no DB)
    // Return encryption result to client
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Backend encryption error:', error);
    return NextResponse.json({ error: error.message || 'Encryption failed' }, { status: 500 });
  }
}
