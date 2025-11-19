// Password hashing utility using Web Crypto API
// This provides a simple hashing solution for browser-based authentication

/**
 * Hash a password using SHA-256
 * Note: For production, consider using Firebase Auth or a proper backend with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Hash password with salt (more secure)
 * Format: salt:hash
 */
export async function hashPasswordWithSalt(password: string): Promise<string> {
  // Generate a random salt
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  const salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Hash password with salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${salt}:${hashHex}`;
}

/**
 * Verify password with salt
 */
export async function verifyPasswordWithSalt(password: string, saltedHash: string): Promise<boolean> {
  const [salt, hash] = saltedHash.split(':');
  if (!salt || !hash) return false;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === hash;
}

