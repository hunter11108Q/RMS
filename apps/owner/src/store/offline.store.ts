import { create } from 'zustand';

interface OfflineState {
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: true,
  setOnlineStatus: (isOnline) => set({ isOnline }),
}));

export default useOfflineStore;
