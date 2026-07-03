/**
 * Storage helpers — wraps expo-secure-store (for tokens) and
 * AsyncStorage (for offline queue / cache).
 *
 * Falls back to in-memory when running outside Expo context.
 */

import { Platform } from 'react-native';

// ─── Secure storage (tokens) ─────────────────────────────────────────────────
let SecureStore: {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
};

if (Platform.OS === 'web') {
  SecureStore = {
    setItemAsync: async (k, v) => {
      try { window.localStorage.setItem(k, v); } catch {}
    },
    getItemAsync: async (k) => {
      try { return window.localStorage.getItem(k); } catch { return null; }
    },
    deleteItemAsync: async (k) => {
      try { window.localStorage.removeItem(k); } catch {}
    },
  };
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SecureStore = require('expo-secure-store');
  } catch {
    // Fallback: plain in-memory map (dev / test)
    const mem: Record<string, string> = {};
    SecureStore = {
      setItemAsync:    async (k, v) => { mem[k] = v; },
      getItemAsync:    async (k)    => mem[k] ?? null,
      deleteItemAsync: async (k)    => { delete mem[k]; },
    };
  }
}

export const secureSet    = (key: string, value: string) => SecureStore.setItemAsync(key, value);
export const secureGet    = (key: string)                => SecureStore.getItemAsync(key);
export const secureDelete = (key: string)                => SecureStore.deleteItemAsync(key);

// ─── AsyncStorage (offline queue / user prefs) ────────────────────────────────
let AsyncStorage: {
  setItem:    (key: string, value: string) => Promise<void>;
  getItem:    (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  const mem2: Record<string, string> = {};
  AsyncStorage = {
    setItem:    async (k, v) => { mem2[k] = v; },
    getItem:    async (k)    => mem2[k] ?? null,
    removeItem: async (k)    => { delete mem2[k]; },
  };
}

export const storageSet    = (key: string, value: string) => AsyncStorage.setItem(key, value);
export const storageGet    = (key: string)                => AsyncStorage.getItem(key);
export const storageDelete = (key: string)                => AsyncStorage.removeItem(key);

export async function storageGetJSON<T>(key: string): Promise<T | null> {
  const raw = await storageGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function storageSetJSON<T>(key: string, value: T): Promise<void> {
  await storageSet(key, JSON.stringify(value));
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN:     'rms_waiter_access_token',
  REFRESH_TOKEN:    'rms_waiter_refresh_token',
  USER:             'rms_waiter_user',
  BRANCH:           'rms_waiter_branch',
  OFFLINE_QUEUE:    'rms_waiter_offline_queue',
  MENU_CACHE:       'rms_waiter_menu_cache',
  TABLE_CACHE:      'rms_waiter_table_cache',
} as const;
