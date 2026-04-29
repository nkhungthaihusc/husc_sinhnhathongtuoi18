import { useCallback, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';
import { tokenStorage } from '../services/tokenStorage.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokenStorage.getAccessToken()));

  const login = useCallback(async (username, password) => {
    const session = await authApi.login({ username, password });
    tokenStorage.setSession({
      accessToken: session?.accessToken,
      refreshToken: session?.refreshToken,
      user: session?.user
    });
    setUser(session?.user ?? null);
    setIsAuthenticated(Boolean(session?.accessToken));
    return session?.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // clear local session anyway
    } finally {
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout
    }),
    [isAuthenticated, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
