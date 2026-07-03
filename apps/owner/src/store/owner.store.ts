import { create } from 'zustand';
import { storageGetJSON, storageSetJSON, STORAGE_KEYS } from '../utils/storage';

export interface BusinessAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  acknowledged: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface OwnerState {
  dashboardKpis: any | null;
  alerts: BusinessAlert[];
  notifications: SystemNotification[];
  lastSynced: string | null;

  setDashboardKpis: (kpis: any) => Promise<void>;
  addAlert: (alert: Omit<BusinessAlert, 'id' | 'timestamp' | 'acknowledged'>) => void;
  ackAlert: (id: string) => void;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  loadCache: () => Promise<void>;
}

export const useOwnerStore = create<OwnerState>((set, get) => ({
  dashboardKpis: null,
  alerts: [
    { id: 'al-1', title: 'Low Stock: Paneer', description: 'Paneer stock level is below 5kg reorder threshold.', timestamp: new Date().toISOString(), severity: 'WARNING', acknowledged: false },
    { id: 'al-2', title: 'Void Bill Alert', description: 'Bill #991 was voided by cashier Amit S.', timestamp: new Date().toISOString(), severity: 'CRITICAL', acknowledged: false },
  ],
  notifications: [
    { id: 'nt-1', title: 'Shift Opened', body: 'Counter Drawer Shift #109 opened with ₹5,000.', timestamp: new Date().toISOString(), read: false },
    { id: 'nt-2', title: 'Large Order Placed', body: 'Table VIP-3 placed order exceeding ₹10,000.', timestamp: new Date().toISOString(), read: true },
  ],
  lastSynced: null,

  setDashboardKpis: async (dashboardKpis) => {
    const lastSynced = new Date().toLocaleTimeString();
    await storageSetJSON(STORAGE_KEYS.DASHBOARD_CACHE, { dashboardKpis, lastSynced });
    set({ dashboardKpis, lastSynced });
  },

  addAlert: (newAlert) => set((state) => ({
    alerts: [
      {
        ...newAlert,
        id: `al-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      },
      ...state.alerts,
    ],
  })),

  ackAlert: (id) => set((state) => ({
    alerts: state.alerts.map((al) => (al.id === id ? { ...al, acknowledged: true } : al)),
  })),

  addNotification: (newNotif) => set((state) => ({
    notifications: [
      {
        ...newNotif,
        id: `nt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...state.notifications,
    ],
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),

  loadCache: async () => {
    const cache = await storageGetJSON<{ dashboardKpis: any; lastSynced: string }>(STORAGE_KEYS.DASHBOARD_CACHE);
    if (cache) {
      set({ dashboardKpis: cache.dashboardKpis, lastSynced: cache.lastSynced });
    }
  },
}));

export default useOwnerStore;
