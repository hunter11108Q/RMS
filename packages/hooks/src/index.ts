import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { UserContext } from '@rms/types';

/**
 * Custom React hook to check and monitor device network availability state.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Authentication Foundation Interfaces (Placeholder parameters)
 */
export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SharedAuthState {
  user: UserContext | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserContext | null, token: string | null, refreshToken?: string | null) => void;
  clearAuth: () => void;
}

/**
 * Global Zustand Auth Store Placeholder
 */
export const useSharedAuthStore = create<SharedAuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, token, refreshToken = null) =>
    set({
      user,
      token,
      refreshToken,
      isAuthenticated: user !== null && token !== null,
    }),
  clearAuth: () =>
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    }),
}));

/**
 * Header payload generator for REST API authentication
 */
export function getAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}
