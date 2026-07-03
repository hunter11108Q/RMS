import { create } from 'zustand';
import { STORAGE_KEYS, storageSetJSON, storageGetJSON } from '../utils/storage';

export interface OfflineMutation {
  id: string;
  action: 'CREATE_ORDER' | 'ADD_ITEM' | 'GENERATE_KOT' | 'UPDATE_TABLE_STATUS';
  url: string;
  method: 'POST' | 'PATCH' | 'PUT';
  payload: any;
  timestamp: number;
}

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  queue: OfflineMutation[];

  setOnlineStatus: (status: boolean) => void;
  loadQueue: () => Promise<void>;
  enqueueMutation: (action: OfflineMutation['action'], url: string, method: OfflineMutation['method'], payload: any) => Promise<void>;
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
    const queue = await storageGetJSON<OfflineMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE);
    set({ queue: queue || [] });
  },

  enqueueMutation: async (action, url, method, payload) => {
    const newMutation: OfflineMutation = {
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
