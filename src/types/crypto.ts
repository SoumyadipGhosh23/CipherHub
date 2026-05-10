export interface AlgorithmOption {
  id: string; // e.g., 'AES-256-CBC'
  name: string;
  description: string;
}

export interface EncryptionResult {
  algorithm: string; // e.g., 'AES-256-CBC'
  encrypted: string; // base64 ciphertext
  iv: string; // base64 initialization vector
}
