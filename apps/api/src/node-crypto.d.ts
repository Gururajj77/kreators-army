// The one node:crypto call the MEGA code makes (workerd implements it under nodejs_compat). Declared here so apps/api
// does not need @types/node, whose globals clash with @cloudflare/workers-types.
declare module 'node:crypto' {
  interface Decipher {
    setAutoPadding(autoPadding: boolean): Decipher;
    update(data: Uint8Array): Uint8Array;
    final(): Uint8Array;
  }
  export function createDecipheriv(algorithm: 'aes-128-ecb' | 'aes-128-cbc', key: Uint8Array, iv: Uint8Array): Decipher;
}
