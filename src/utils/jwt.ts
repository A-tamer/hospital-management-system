// Lightweight client-side JWT helper (unsigned token for front-end authorization only)
// NOTE: For real production security, JWTs must be generated and verified on a backend with a secret key.

const JWT_STORAGE_KEY = 'hospital_jwt';

export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: string;
  name: string;
  iat: number;        // issued at (unix seconds)
  exp: number;        // expiry (unix seconds)
  [key: string]: any;
}

function base64UrlEncode(obj: any): string {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode<T = any>(segment: string): T | null {
  try {
    const padded = segment.padEnd(segment.length + (4 - (segment.length % 4)) % 4, '=')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Create a simple unsigned JWT-like token (alg: \"none\") for client-side use.
 * This is ONLY for front-end route guarding / session representation.
 */
export function createJwtToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInMs: number): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + Math.floor(expiresInMs / 1000);

  const header = { alg: 'none', typ: 'JWT' };
  const fullPayload: JwtPayload = {
    ...(payload as JwtPayload),
    iat: nowSec,
    exp: expSec,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);

  // Unsigned token (no valid signature) — for client-side use only
  return `${encodedHeader}.${encodedPayload}.`;
}

export function decodeJwtToken(token: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return base64UrlDecode<JwtPayload>(parts[1]);
}

export function isJwtValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtToken(token);
  if (!payload || !payload.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec < payload.exp;
}

export function saveJwtToken(token: string): void {
  localStorage.setItem(JWT_STORAGE_KEY, token);
}

export function getJwtToken(): string | null {
  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function clearJwtToken(): void {
  localStorage.removeItem(JWT_STORAGE_KEY);
}


