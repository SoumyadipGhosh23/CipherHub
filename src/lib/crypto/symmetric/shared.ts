import { randomBytes } from 'crypto';

const DEMO_SECRET = Buffer.from('cipherlab-demo-backend-key-material-32bytes!');

export function getKeyBytes(length: number): Buffer {
  if (length <= 0) {
    throw new Error('Invalid key length');
  }

  if (DEMO_SECRET.length >= length) {
    return DEMO_SECRET.subarray(0, length);
  }

  const buffer = Buffer.alloc(length);
  let offset = 0;

  while (offset < length) {
    const chunk = DEMO_SECRET.subarray(0, Math.min(DEMO_SECRET.length, length - offset));
    chunk.copy(buffer, offset);
    offset += chunk.length;
  }

  return buffer;
}

export function generateIv(length: number): Buffer {
  return randomBytes(length);
}

export function decodeBase64(value: string): Buffer {
  return Buffer.from(value, 'base64');
}

export function encodeBase64(value: Buffer): string {
  return value.toString('base64');
}
