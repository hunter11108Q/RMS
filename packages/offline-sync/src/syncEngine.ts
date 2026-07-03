export type ConflictStrategy = 'LAST_UPDATED_WINS' | 'SERVER_WINS' | 'CLIENT_WINS';

export interface SyncMutation {
  id: string;
  action: string;
  payload: any;
  timestamp: string;
  retryCount: number;
}

export interface ConflictAuditRecord {
  recordId: string;
  strategyUsed: ConflictStrategy;
  clientData: any;
  serverData: any;
  resolvedData: any;
  timestamp: string;
}

export class SyncEngine {
  private queue: SyncMutation[] = [];
  private conflictsAudit: ConflictAuditRecord[] = [];
  private strategy: ConflictStrategy = 'LAST_UPDATED_WINS';
  private syncInProgress = false;

  constructor(strategy: ConflictStrategy = 'LAST_UPDATED_WINS') {
    this.strategy = strategy;
  }

  public enqueue(action: string, payload: any): SyncMutation {
    const mutation: SyncMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    this.queue.push(mutation);
    return mutation;
  }

  public getQueue(): SyncMutation[] {
    return this.queue;
  }

  public getConflictsAudit(): ConflictAuditRecord[] {
    return this.conflictsAudit;
  }

  public resolveConflict(
    recordId: string,
    clientRecord: { data: any; updatedAt: string },
    serverRecord: { data: any; updatedAt: string }
  ): any {
    let resolvedData: any;

    if (this.strategy === 'SERVER_WINS') {
      resolvedData = serverRecord.data;
    } else if (this.strategy === 'CLIENT_WINS') {
      resolvedData = clientRecord.data;
    } else {
      // LAST_UPDATED_WINS
      const clientTime = new Date(clientRecord.updatedAt).getTime();
      const serverTime = new Date(serverRecord.updatedAt).getTime();
      resolvedData = clientTime >= serverTime ? clientRecord.data : serverRecord.data;
    }

    // Log audit trail
    this.conflictsAudit.push({
      recordId,
      strategyUsed: this.strategy,
      clientData: clientRecord.data,
      serverData: serverRecord.data,
      resolvedData,
      timestamp: new Date().toISOString(),
    });

    return resolvedData;
  }

  public async processQueue(sendToServer: (mut: SyncMutation) => Promise<boolean>): Promise<void> {
    if (this.syncInProgress || this.queue.length === 0) return;

    this.syncInProgress = true;
    const items = [...this.queue];

    for (const item of items) {
      try {
        const success = await sendToServer(item);
        if (success) {
          this.queue = this.queue.filter((q) => q.id !== item.id);
        } else {
          item.retryCount++;
          if (item.retryCount >= 5) {
            // Move item to dead-letter queue / drop to prevent blocking
            this.queue = this.queue.filter((q) => q.id !== item.id);
            console.error(`Mutation ${item.id} exceeded retry limit. Removed from queue.`);
          }
        }
      } catch (err) {
        console.warn(`Sync mutation fail: ${item.id}`, err);
        break; // Pause on network connection dropouts
      }
    }

    this.syncInProgress = false;
  }
}
export default SyncEngine;
