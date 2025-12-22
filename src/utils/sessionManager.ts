// Session Management Utility
// Manages user login sessions with expiration + companion JWT token

import { createJwtToken, saveJwtToken, clearJwtToken } from './jwt';

const SESSION_KEY = 'hospital_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export interface SessionData {
  user: any;
  expiresAt: number;
  createdAt: number;
}

/**
 * Save user session to localStorage
 */
export function saveSession(user: any): void {
  // Create a simple front-end JWT token (unsigned, for client-side auth only)
  const token = createJwtToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    SESSION_DURATION
  );

  const sessionData: SessionData = {
    user,
    expiresAt: Date.now() + SESSION_DURATION,
    createdAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  saveJwtToken(token);
}

/**
 * Get current session if valid
 */
export function getSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    const session: SessionData = JSON.parse(sessionStr);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    clearSession();
    return null;
  }
}

/**
 * Check if session is valid
 */
export function isSessionValid(): boolean {
  const session = getSession();
  return session !== null;
}

/**
 * Clear session
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('currentUser');
  clearJwtToken();
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(): number {
  const session = getSession();
  if (!session) return 0;
  return Math.max(0, session.expiresAt - Date.now());
}

/**
 * Extend session (reset expiration)
 */
export function extendSession(): void {
  const session = getSession();
  if (session) {
    saveSession(session.user);
  }
}

