export type ConnectionStatus = 'ONLINE' | 'SLOW_CONNECTION' | 'OFFLINE';

export interface ConnectivityListener {
  onStatusChange: (status: ConnectionStatus, latency: number) => void;
}

export class ConnectivityMonitor {
  private status: ConnectionStatus = 'ONLINE';
  private latency = 0;
  private listeners: Set<ConnectivityListener> = new Set();
  private intervalId: any = null;
  private pingUrl: string;
  private intervalMs: number;

  constructor(pingUrl = 'http://localhost:3000/live', intervalMs = 15000) {
    this.pingUrl = pingUrl;
    this.intervalMs = intervalMs;
  }

  public start(): void {
    if (this.intervalId) return;

    this.checkReachability();
    this.intervalId = setInterval(() => this.checkReachability(), this.intervalMs);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getLatency(): number {
    return this.latency;
  }

  public addListener(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async checkReachability(): Promise<void> {
    const startTime = Date.now();
    try {
      // Small timeout to prevent long hanging connection checks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.pingUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });

      clearTimeout(timeoutId);
      this.latency = Date.now() - startTime;

      let newStatus: ConnectionStatus = 'ONLINE';
      if (response.ok) {
        if (this.latency > 1500) {
          newStatus = 'SLOW_CONNECTION';
        }
      } else {
        newStatus = 'OFFLINE';
      }

      this.updateStatus(newStatus);
    } catch {
      this.latency = 0;
      this.updateStatus('OFFLINE');
    }
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach((listener) => {
        try {
          listener.onStatusChange(this.status, this.latency);
        } catch (err) {
          console.warn('ConnectivityMonitor listener error:', err);
        }
      });
    }
  }
}
