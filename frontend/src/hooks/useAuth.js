import { useContext } from 'react';
import { AuthContext } from '../contexts/auth-context.js';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return ctx;
}
