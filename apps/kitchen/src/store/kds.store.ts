import { create } from 'zustand';
import { KotTicketInfo, RestaurantTableInfo } from '@rms/types';
import { storageGetJSON, storageSetJSON, STORAGE_KEYS } from '../utils/storage';

interface KdsState {
  selectedStation: string; // e.g. 'ALL', 'MAIN_KITCHEN', 'BAR', 'DESSERT', etc.
  kots: any[];
  tables: RestaurantTableInfo[];
  soundEnabled: boolean;

  setStation: (station: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  setKots: (kots: any[]) => void;
  setTables: (tables: RestaurantTableInfo[]) => void;
  toggleSound: () => void;
  updateKotLocalStatus: (kotId: string, status: string) => void;
}

export const useKdsStore = create<KdsState>((set, get) => ({
  selectedStation: 'ALL',
  kots: [],
  tables: [],
  soundEnabled: true,

  setStation: async (station) => {
    await storageSetJSON(STORAGE_KEYS.STATION, station);
    set({ selectedStation: station });
  },

  loadSettings: async () => {
    const station = await storageGetJSON<string>(STORAGE_KEYS.STATION);
    set({ selectedStation: station || 'ALL' });
  },

  setKots: (kots) => set({ kots }),
  setTables: (tables) => set({ tables }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  updateKotLocalStatus: (kotId, status) => set((state) => ({
    kots: state.kots.map((k) => (k.id === kotId ? { ...k, status } : k)),
  })),
}));

export default useKdsStore;
