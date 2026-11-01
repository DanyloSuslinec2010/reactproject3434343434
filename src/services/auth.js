function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)));
}

async function hashPassword(password, salt) {
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const result = await window.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 120000,
    hash: 'SHA-256',
  }, key, 256);

  return new Uint8Array(result);
}

export async function createPasswordCredential(password) {
  if (!window.crypto?.subtle) {
    throw new Error('Secure password storage is unavailable in this browser.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);

  return {
    salt: bytesToHex(salt),
    hash: bytesToHex(hash),
  };
}

export async function verifyPassword(password, credential) {
  if (!window.crypto?.subtle) {
    throw new Error('Secure password verification is unavailable in this browser.');
  }

  if (!credential?.salt || !credential?.hash) {
    return false;
  }

  const hash = await hashPassword(password, hexToBytes(credential.salt));
  const expectedHash = hexToBytes(credential.hash);

  return hash.length === expectedHash.length
    && hash.every((byte, index) => byte === expectedHash[index]);
}
