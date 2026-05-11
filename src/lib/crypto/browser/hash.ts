import { encodeBase64, encodeUtf8 } from './encoding';

export async function digestBrowserSha256(message: string): Promise<string> {
  const digest = await window.crypto.subtle.digest('SHA-256', encodeUtf8(message).buffer as ArrayBuffer);
  return encodeBase64(digest);
}

export async function digestBrowserSha512(message: string): Promise<string> {
  const digest = await window.crypto.subtle.digest('SHA-512', encodeUtf8(message).buffer as ArrayBuffer);
  return encodeBase64(digest);
}

export async function digestBrowserShaHex(message: string, algorithm: 'SHA-256' | 'SHA-512'): Promise<string> {
  const digest = await window.crypto.subtle.digest(algorithm, encodeUtf8(message).buffer as ArrayBuffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
