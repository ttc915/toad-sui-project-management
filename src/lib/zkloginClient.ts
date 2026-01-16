export interface ZkLoginState {
  address: string | null;
  ephemeralKeyPair: any | null;
  jwt: string | null;
  salt: string | null;
}

const ZKLOGIN_STORAGE_KEY = 'toad_zklogin_state';

export function getZkLoginState(): ZkLoginState | null {
  try {
    const stored = localStorage.getItem(ZKLOGIN_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setZkLoginState(state: ZkLoginState): void {
  localStorage.setItem(ZKLOGIN_STORAGE_KEY, JSON.stringify(state));
}

export function clearZkLoginState(): void {
  localStorage.removeItem(ZKLOGIN_STORAGE_KEY);
}

export function isZkLoginActive(): boolean {
  const state = getZkLoginState();
  return state !== null && state.address !== null;
}

export async function initiateZkLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;

  if (!clientId) {
    throw new Error('Google Client ID not configured');
  }

  const nonce = generateNonce();

  sessionStorage.setItem('zklogin_nonce', nonce);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'id_token');
  authUrl.searchParams.append('scope', 'openid email profile');
  authUrl.searchParams.append('nonce', nonce);

  window.location.href = authUrl.toString();
}

export async function handleZkLoginCallback(): Promise<ZkLoginState | null> {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const idToken = params.get('id_token');

  if (!idToken) {
    console.error('No ID token found in callback');
    return null;
  }

  const nonce = sessionStorage.getItem('zklogin_nonce');
  if (!nonce) {
    console.error('No nonce found in session');
    return null;
  }

  const zkAddress = await deriveZkLoginAddress(idToken, nonce);

  const state: ZkLoginState = {
    address: zkAddress,
    ephemeralKeyPair: null,
    jwt: idToken,
    salt: nonce,
  };

  setZkLoginState(state);

  sessionStorage.removeItem('zklogin_nonce');

  return state;
}

function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

async function deriveZkLoginAddress(jwt: string, salt: string): Promise<string> {
  const parts = jwt.split('.');
  const payload = JSON.parse(atob(parts[1]));

  const sub = payload.sub;
  const aud = payload.aud;

  const addressInput = `${sub}:${aud}:${salt}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(addressInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return `0x${hashHex.slice(0, 40)}`;
}

export function getZkLoginAddress(): string | null {
  const state = getZkLoginState();
  return state?.address || null;
}
