export async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptText(
  plaintext: string,
  key: CryptoKey,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data,
  );

  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), iv.length);

  return result;
}

export async function decryptText(
  ciphertext: Uint8Array,
  key: CryptoKey,
): Promise<string> {
  const iv = ciphertext.slice(0, 12);
  const data = ciphertext.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(keyData: string): Promise<CryptoKey> {
  const rawKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt'],
  );
}
