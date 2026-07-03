import { create } from 'zustand';
import { OrderItem } from '@rms/types';

interface CartState {
  tableId: string | null;
  tableName: string | null;
  orderId: string | null; // null for new orders
  customerName: string;
  customerPhone: string;
  guestsCount: number;
  items: OrderItem[];
  notes: string;

  setTable: (tableId: string | null, tableName: string | null) => void;
  setOrderId: (orderId: string | null) => void;
  setCustomer: (name: string, phone: string) => void;
  setGuestsCount: (count: number) => void;
  addItem: (item: OrderItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  setOrderNotes: (notes: string) => void;
  loadOrder: (order: any) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  tableId: null,
  tableName: null,
  orderId: null,
  customerName: '',
  customerPhone: '',
  guestsCount: 1,
  items: [],
  notes: '',

  setTable: (tableId, tableName) => set({ tableId, tableName }),
  setOrderId: (orderId) => set({ orderId }),
  setCustomer: (customerName, customerPhone) => set({ customerName, customerPhone }),
  setGuestsCount: (guestsCount) => set({ guestsCount }),
  
  addItem: (newItem) => set((state) => {
    const existingIndex = state.items.findIndex(
      (i) => i.menuItemId === newItem.menuItemId && 
             JSON.stringify(i.modifiers) === JSON.stringify(newItem.modifiers)
    );

    if (existingIndex > -1) {
      const updatedItems = [...state.items];
      updatedItems[existingIndex].quantity += newItem.quantity;
      return { items: updatedItems };
    }
    return { items: [...state.items, newItem] };
  }),

  removeItem: (itemId) => set((state) => ({
    items: state.items.filter((i) => i.itemId !== itemId),
  })),

  updateQuantity: (itemId, quantity) => set((state) => ({
    items: state.items.map((i) => (i.itemId === itemId ? { ...i, quantity } : i)),
  })),

  updateNotes: (itemId, notes) => set((state) => ({
    items: state.items.map((i) => (i.itemId === itemId ? { ...i, notes } : i)),
  })),

  setOrderNotes: (notes) => set({ notes }),

  loadOrder: (order) => set({
    orderId: order.id,
    tableId: order.tableId || null,
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    guestsCount: order.guestsCount || 1,
    notes: order.notes || '',
    items: order.items.map((i: any) => ({
      id: i.id,
      itemId: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      notes: i.notes || '',
      modifiers: i.modifiers || [],
    })),
  }),

  clearCart: () => set({
    tableId: null,
    tableName: null,
    orderId: null,
    customerName: '',
    customerPhone: '',
    guestsCount: 1,
    items: [],
    notes: '',
  }),
}));

export default useCartStore;
