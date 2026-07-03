import { useKdsStore } from '../src/store/kds.store';
import { useOfflineStore } from '../src/store/offline.store';

describe('Kitchen Display System (KDS) Tests Suite', () => {
  beforeEach(() => {
    useOfflineStore.getState().clearQueue();
  });

  it('should verify local station filtering matching rules', () => {
    const isItemMatchingStation = (itemName: string, selectedStation: string) => {
      if (selectedStation === 'ALL') return true;

      const lower = itemName.toLowerCase();
      const isDrink = lower.includes('juice') || lower.includes('drink') || lower.includes('wine') || 
                      lower.includes('beer') || lower.includes('cola') || lower.includes('soda') || 
                      lower.includes('tea') || lower.includes('coffee') || lower.includes('beverage') || 
                      lower.includes('mocktail');
      const isDessert = lower.includes('ice cream') || lower.includes('brownie') || lower.includes('kulfi') || 
                        lower.includes('dessert') || lower.includes('halwa') || lower.includes('jamun');
      const isTandoor = lower.includes('naan') || lower.includes('roti') || lower.includes('kulcha') || 
                        lower.includes('tandoori') || lower.includes('kebab') || lower.includes('tikka');

      if (selectedStation === 'BAR') return isDrink;
      if (selectedStation === 'DESSERT') return isDessert;
      if (selectedStation === 'TANDOOR') return isTandoor;
      
      if (selectedStation === 'MAIN_KITCHEN') {
        return !isDrink && !isDessert && !isTandoor;
      }
      return true;
    };

    expect(isItemMatchingStation('Mango Juice', 'BAR')).toBe(true);
    expect(isItemMatchingStation('Paneer Naan', 'TANDOOR')).toBe(true);
    expect(isItemMatchingStation('Paneer Butter Masala', 'MAIN_KITCHEN')).toBe(true);
    expect(isItemMatchingStation('Mango Juice', 'MAIN_KITCHEN')).toBe(false);
  });

  it('should verify offline queue mutation enqueuing in KDS', async () => {
    const store = useOfflineStore.getState();
    expect(store.queue.length).toBe(0);

    await store.enqueueMutation('UPDATE_KOT_STATUS', '/orders/kots/kot-1/status', 'PATCH', {
      status: 'PREPARING',
    });

    const queue = useOfflineStore.getState().queue;
    expect(queue.length).toBe(1);
    expect(queue[0].action).toBe('UPDATE_KOT_STATUS');
    expect(queue[0].payload.status).toBe('PREPARING');
  });
});
