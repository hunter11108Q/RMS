import { useCartStore } from '../src/store/cart.store';
import { useOfflineStore } from '../src/store/offline.store';

describe('Waiter Handheld Console Unit Suite', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useOfflineStore.getState().clearQueue();
  });

  it('should verify pricing calculations and quantity updates in cart store', () => {
    const cart = useCartStore.getState();
    
    // Add first item
    cart.addItem({
      id: 'cart-1',
      itemId: 'item-paneer',
      menuItemId: 'paneer-butter-masala-uuid',
      name: 'Paneer Butter Masala',
      quantity: 2,
      unitPrice: 280,
    });

    // Add identical item to increment quantity
    cart.addItem({
      id: 'cart-2',
      itemId: 'item-paneer',
      menuItemId: 'paneer-butter-masala-uuid',
      name: 'Paneer Butter Masala',
      quantity: 1,
      unitPrice: 280,
    });

    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(3);
    
    const total = items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0);
    expect(total).toBe(840);
  });

  it('should verify offline queue mutation tracking', async () => {
    const store = useOfflineStore.getState();
    expect(store.queue.length).toBe(0);

    await store.enqueueMutation('CREATE_ORDER', '/orders', 'POST', {
      tableId: 't1-uuid',
      type: 'DINE_IN',
      items: [{ menuItemId: 'item-1', quantity: 2 }],
    });

    const queue = useOfflineStore.getState().queue;
    expect(queue.length).toBe(1);
    expect(queue[0].action).toBe('CREATE_ORDER');
    expect(queue[0].method).toBe('POST');
  });
});
