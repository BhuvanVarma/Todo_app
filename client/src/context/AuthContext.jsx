import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

// A non-sensitive hint stored in localStorage so we know whether to attempt
// /api/auth/me on page load. This avoids a noisy 401 in the console when
// the user simply hasn't logged in yet. The httpOnly cookie remains the
// real source of truth — if it's missing/expired the server returns 401
// and we clear the hint.
const SESSION_HINT_KEY = 'pern_todo_session';

export function markLoggedIn()  { localStorage.setItem(SESSION_HINT_KEY, '1'); }
export function markLoggedOut() { localStorage.removeItem(SESSION_HINT_KEY); }
export function hasSessionHint() { return !!localStorage.getItem(SESSION_HINT_KEY); }

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip the network round-trip entirely when we know there's no session.
    if (!hasSessionHint()) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Cookie is gone or expired — clear the stale hint.
        markLoggedOut();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // Even if the request fails, clear the client state.
    }
    markLoggedOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

