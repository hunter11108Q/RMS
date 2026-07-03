import useAuthStore from '../store/auth.store';
import useOwnerStore from '../store/owner.store';
import * as Haptics from 'expo-haptics';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private isIntentionalClose = false;

  public connect(): void {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    this.isIntentionalClose = false;
    const wsUrl = `ws://localhost:3000?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Owner Dashboard WebSocket connected.');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          this.handleIncomingMessage(envelope);
        } catch (err) {
          console.warn('Owner WS payload error:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Owner WS error:', err);
      };

      this.ws.onclose = () => {
        console.log('Owner WS disconnected.');
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.warn('Owner WS connection fail:', err);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private handleIncomingMessage(envelope: any): void {
    const { event, payload } = envelope;
    const store = useOwnerStore.getState();

    // Trigger haptic alert
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }

    if (event === 'bill.cancelled') {
      store.addAlert({
        title: 'Bill Cancelled',
        description: `Bill ID #${payload.billId?.slice(-6).toUpperCase()} was voided by ${payload.cashierName || 'Cashier'}.`,
        severity: 'CRITICAL',
      });
      store.addNotification({
        title: 'Void Transaction Alert',
        body: `A checkout bill of ₹${payload.amount} was cancelled.`,
      });
    } else if (event === 'low_stock') {
      store.addAlert({
        title: 'Low Inventory Reorder',
        description: `Ingredient ${payload.ingredientName} is below critical threshold of ${payload.reorderLevel} units.`,
        severity: 'WARNING',
      });
      store.addNotification({
        title: 'Inventory Alert',
        body: `${payload.ingredientName} requires immediate reordering.`,
      });
    } else if (event === 'large_order') {
      store.addNotification({
        title: 'High Value Sale',
        body: `Order #${payload.orderId?.slice(-6).toUpperCase()} placed exceeding ₹${payload.amount}.`,
      });
    } else if (event === 'refund') {
      store.addAlert({
        title: 'Refund Processed',
        description: `A refund of ₹${payload.amount} was processed for Bill #${payload.billId?.slice(-6).toUpperCase()}.`,
        severity: 'CRITICAL',
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      console.log('Owner WS reconnecting...');
      this.connect();
    }, 5000);
  }
}

export const wsClient = new WebSocketClient();
export default wsClient;
