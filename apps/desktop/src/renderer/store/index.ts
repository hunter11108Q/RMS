import { create } from 'zustand';
import { OrderItemInfo } from '@rms/types';

// ─── View type (all navigable screens) ──────────────────────────────────────
export type AppView =
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'tables'
  | 'catalog'
  | 'inventory'
  | 'reports'
  | 'management';

// ─── Notification model ──────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  createdAt: number;
}

// ─── POS cart state ──────────────────────────────────────────────────────────
interface PosState {
  selectedTableId: string | null;
  activeCart: OrderItemInfo[];
  selectedCategory: string;
  selectTable: (tableId: string | null) => void;
  addToCart: (item: OrderItemInfo) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  setSelectedCategory: (category: string) => void;
}

// ─── App shell state ─────────────────────────────────────────────────────────
interface AppState {
  currentView: AppView;
  sidebarCollapsed: boolean;
  activeUser: { id: string; name: string; role: string } | null;
  activeBranch: { id: string; name: string } | null;
  shiftOpen: boolean;
  notifications: AppNotification[];

  // Actions
  setView: (view: AppView) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveUser: (user: AppState['activeUser']) => void;
  setActiveBranch: (branch: AppState['activeBranch']) => void;
  setShiftOpen: (open: boolean) => void;
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;
}

// ─── Combined store ──────────────────────────────────────────────────────────
type Store = PosState & AppState;

export const useAppStore = create<Store>((set) => ({
  // ── POS ────────────────────────────────────────────────────────────────────
  selectedTableId: null,
  activeCart: [],
  selectedCategory: 'ALL',
  selectTable: (tableId) => set({ selectedTableId: tableId }),
  addToCart: (item) =>
    set((state) => {
      const existing = state.activeCart.find((i) => i.itemId === item.itemId);
      if (existing) {
        return {
          activeCart: state.activeCart.map((i) =>
            i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { activeCart: [...state.activeCart, item] };
    }),
  removeFromCart: (itemId) =>
    set((state) => ({ activeCart: state.activeCart.filter((i) => i.itemId !== itemId) })),
  updateCartQty: (itemId, qty) =>
    set((state) => ({
      activeCart:
        qty <= 0
          ? state.activeCart.filter((i) => i.itemId !== itemId)
          : state.activeCart.map((i) => (i.itemId === itemId ? { ...i, quantity: qty } : i)),
    })),
  clearCart: () => set({ activeCart: [] }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // ── App Shell ──────────────────────────────────────────────────────────────
  currentView: 'dashboard',
  sidebarCollapsed: false,
  activeUser: { id: 'usr-1', name: 'Admin User', role: 'Admin' },
  activeBranch: { id: 'br-1', name: 'Main Branch – MG Road' },
  shiftOpen: true,
  notifications: [],

  setView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setActiveUser: (user) => set({ activeUser: user }),
  setActiveBranch: (branch) => set({ activeBranch: branch }),
  setShiftOpen: (open) => set({ shiftOpen: open }),
  pushNotification: (n) =>
    set((state) => ({
      notifications: [
        { ...n, id: `notif-${Date.now()}-${Math.random()}`, createdAt: Date.now() },
        ...state.notifications,
      ].slice(0, 20),
    })),
  dismissNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));

// ─── Legacy alias (keeps existing panels working that import usePosStore) ───
export const usePosStore = useAppStore;
