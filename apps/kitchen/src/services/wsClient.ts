import useAuthStore from '../store/auth.store';

type WsEventListener = (payload: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<WsEventListener>> = new Map();
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
        console.log('KDS WebSocket connected.');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          const eventName = envelope.event;
          const listeners = this.listeners.get(eventName);
          if (listeners) {
            listeners.forEach((listener) => listener(envelope.payload));
          }
        } catch (err) {
          console.warn('KDS WS parsing error:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('KDS WebSocket error:', err);
      };

      this.ws.onclose = () => {
        console.log('KDS WebSocket closed.');
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.warn('KDS WS connection fail:', err);
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

  public on(event: string, listener: WsEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      console.log('KDS WS reconnecting...');
      this.connect();
    }, 5000);
  }
}

export const wsClient = new WebSocketClient();
export default wsClient;
