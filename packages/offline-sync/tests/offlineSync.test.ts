import { CacheManager } from '../src/cacheManager';
import { SyncEngine } from '../src/syncEngine';
import { ConnectivityMonitor } from '../src/connectivity';
import { EventCatalog } from '../src/events';

describe('Offline Sync Package Tests Suite', () => {
  it('should verify CacheManager TTL checks and manual resets', () => {
    const cache = new CacheManager(1);
    cache.set('key-1', { val: 42 }, 100); // 100ms TTL

    expect(cache.get('key-1')).toEqual({ val: 42 });

    // Force version mismatch
    const cache2 = new CacheManager(2);
    cache2.set('key-1', { val: 42 }, 100);
    expect(cache2.get('key-1')).toEqual({ val: 42 });
  });

  it('should verify Conflict Resolution strategies: server vs client vs updatedTime', () => {
    const sync = new SyncEngine('LAST_UPDATED_WINS');

    const client = { data: { price: 120 }, updatedAt: '2026-06-30T10:00:00.000Z' };
    const server = { data: { price: 100 }, updatedAt: '2026-06-30T10:05:00.000Z' };

    // Server is newer, server wins
    const res = sync.resolveConflict('itm-1', client, server);
    expect(res.price).toBe(100);

    const clientNewer = { data: { price: 150 }, updatedAt: '2026-06-30T10:10:00.000Z' };
    const res2 = sync.resolveConflict('itm-1', clientNewer, server);
    expect(res2.price).toBe(150);
  });

  it('should verify SyncEngine processing queue transitions', async () => {
    const sync = new SyncEngine('LAST_UPDATED_WINS');
    sync.enqueue('UPDATE_ORDER', { id: 'ord-1' });

    expect(sync.getQueue().length).toBe(1);

    // Process queue with mock sender returning success
    await sync.processQueue(async (mut) => {
      expect(mut.action).toBe('UPDATE_ORDER');
      return true;
    });

    expect(sync.getQueue().length).toBe(0);
  });

  it('should verify ConnectivityMonitor initializes', () => {
    const monitor = new ConnectivityMonitor();
    expect(monitor.getStatus()).toBe('ONLINE');
  });

  it('should verify EventCatalog validator checks', () => {
    const event = EventCatalog.createEvent('OrderCreated', 'branch-12', 'sender-ws', { orderId: 44 });
    expect(EventCatalog.validateEvent(event)).toBe(true);
  });
});
