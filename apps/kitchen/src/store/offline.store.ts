import { create } from 'zustand';
import { STORAGE_KEYS, storageSetJSON, storageGetJSON } from '../utils/storage';

export interface KdsOfflineMutation {
  id: string;
  action: 'UPDATE_KOT_STATUS';
  url: string;
  method: 'POST' | 'PATCH' | 'PUT';
  payload: any;
  timestamp: number;
}

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  queue: KdsOfflineMutation[];

  setOnlineStatus: (status: boolean) => void;
  loadQueue: () => Promise<void>;
  enqueueMutation: (action: KdsOfflineMutation['action'], url: string, method: KdsOfflineMutation['method'], payload: any) => Promise<void>;
  removeMutation: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  setSyncing: (status: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  queue: [],

  setOnlineStatus: (isOnline) => set({ isOnline }),

  loadQueue: async () => {
    const queue = await storageGetJSON<KdsOfflineMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE);
    set({ queue: queue || [] });
  },

  enqueueMutation: async (action, url, method, payload) => {
    const newMutation: KdsOfflineMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      url,
      method,
      payload,
      timestamp: Date.now(),
    };

    const updatedQueue = [...get().queue, newMutation];
    set({ queue: updatedQueue });
    await storageSetJSON(STORAGE_KEYS.OFFLINE_QUEUE, updatedQueue);
  },

  removeMutation: async (id) => {
    const updatedQueue = get().queue.filter((m) => m.id !== id);
    set({ queue: updatedQueue });
    await storageSetJSON(STORAGE_KEYS.OFFLINE_QUEUE, updatedQueue);
  },

  clearQueue: async () => {
    set({ queue: [] });
    await storageSetJSON(STORAGE_KEYS.OFFLINE_QUEUE, []);
  },

  setSyncing: (isSyncing) => set({ isSyncing }),
}));

export default useOfflineStore;
