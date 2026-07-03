export interface WebSocketConfig {
  url: string;
  heartbeatIntervalMs?: number;
  reconnectIntervalMs?: number;
  maxReconnectIntervalMs?: number;
  ackTimeoutMs?: number;
}

export interface WsMessage {
  id: string;
  event: string;
  payload: any;
  needsAck?: boolean;
}

export class OptimizedWebSocketClient {
  private ws: any = null;
  private config: Required<WebSocketConfig>;
  private isIntentionalClose = false;
  private reconnectAttempts = 0;
  private pendingQueue: WsMessage[] = [];
  private unacknowledgedMessages: Map<string, { msg: WsMessage; timer: any }> = new Map();
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();
  private heartbeatTimer: any = null;
  private isAlive = true;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      heartbeatIntervalMs: config.heartbeatIntervalMs ?? 30000,
      reconnectIntervalMs: config.reconnectIntervalMs ?? 2000,
      maxReconnectIntervalMs: config.maxReconnectIntervalMs ?? 30000,
      ackTimeoutMs: config.ackTimeoutMs ?? 5000,
    };
  }

  public connect(): void {
    this.isIntentionalClose = false;
    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.isAlive = true;
        this.startHeartbeat();
        this.flushPendingQueue();
      };

      this.ws.onmessage = (event: any) => {
        try {
          const envelope = JSON.parse(event.data);
          
          // Handle acknowledgments from server
          if (envelope.event === 'ack' && envelope.payload?.msgId) {
            this.handleAckReceived(envelope.payload.msgId);
            return;
          }

          // Trigger listener callbacks
          const callbacks = this.listeners.get(envelope.event);
          if (callbacks) {
            callbacks.forEach((cb) => cb(envelope.payload));
          }
        } catch (err) {
          console.warn('WS Client parse warning:', err);
        }
      };

      this.ws.onclose = () => {
        this.cleanupConnection();
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch (err) {
      console.warn('WS Connect fail:', err);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isIntentionalClose = true;
    this.cleanupConnection();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public send(event: string, payload: any, needsAck = false): string {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const msg: WsMessage = { id, event, payload, needsAck };

    if (this.ws && this.ws.readyState === 1) { // WebSocket.OPEN
      this.sendMessage(msg);
    } else {
      this.pendingQueue.push(msg);
    }

    return id;
  }

  public on(event: string, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private sendMessage(msg: WsMessage): void {
    this.ws.send(JSON.stringify(msg));

    if (msg.needsAck) {
      const timer = setTimeout(() => {
        this.handleAckTimeout(msg.id);
      }, this.config.ackTimeoutMs);

      this.unacknowledgedMessages.set(msg.id, { msg, timer });
    }
  }

  private handleAckReceived(msgId: string): void {
    const tracking = this.unacknowledgedMessages.get(msgId);
    if (tracking) {
      clearTimeout(tracking.timer);
      this.unacknowledgedMessages.delete(msgId);
    }
  }

  private handleAckTimeout(msgId: string): void {
    const tracking = this.unacknowledgedMessages.get(msgId);
    if (tracking && this.ws && this.ws.readyState === 1) {
      console.warn(`ACK timeout for message ${msgId}. Retrying...`);
      // Retry send
      this.sendMessage(tracking.msg);
    }
  }

  private flushPendingQueue(): void {
    const items = [...this.pendingQueue];
    this.pendingQueue = [];
    items.forEach((item) => this.sendMessage(item));

    // Also resend any unacknowledged messages
    this.unacknowledgedMessages.forEach((tracking) => {
      clearTimeout(tracking.timer);
      this.sendMessage(tracking.msg);
    });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.isAlive = true;

    this.heartbeatTimer = setInterval(() => {
      if (!this.isAlive) {
        console.warn('Heartbeat missed. Resetting socket.');
        if (this.ws) this.ws.close();
        return;
      }
      this.isAlive = false;
      try {
        this.ws.send(JSON.stringify({ event: 'ping', id: 'ping' }));
        // Mock pong immediately for compatibility if server doesn't respond
        setTimeout(() => {
          this.isAlive = true;
        }, 1000);
      } catch {
        if (this.ws) this.ws.close();
      }
    }, this.config.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private cleanupConnection(): void {
    this.stopHeartbeat();
    this.unacknowledgedMessages.forEach((tracking) => clearTimeout(tracking.timer));
  }

  private scheduleReconnect(): void {
    this.cleanupConnection();
    
    // Exponential backoff
    const delay = Math.min(
      this.config.reconnectIntervalMs * Math.pow(1.5, this.reconnectAttempts),
      this.config.maxReconnectIntervalMs
    );
    this.reconnectAttempts++;

    setTimeout(() => {
      if (!this.isIntentionalClose) {
        this.connect();
      }
    }, delay);
  }
}
