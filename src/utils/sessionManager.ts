// Session Management Utility
// Manages user login sessions with expiration

const SESSION_KEY = 'hospital_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface SessionData {
  user: any;
  expiresAt: number;
  createdAt: number;
}

/**
 * Save user session to localStorage
 */
export function saveSession(user: any): void {
  const sessionData: SessionData = {
    user,
    expiresAt: Date.now() + SESSION_DURATION,
    createdAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
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

