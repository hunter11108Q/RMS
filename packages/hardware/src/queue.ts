import { PrinterConfigInfo } from '@rms/types';

export interface PrintJob {
  id: string;
  printer: PrinterConfigInfo;
  payload: Buffer;
  priority: number; // Higher is processed first
  status: 'PENDING' | 'PRINTING' | 'SUCCESS' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  timestamp: string;
  error?: string;
}

export class PrintQueueManager {
  private queue: PrintJob[] = [];
  private isProcessing = false;
  private driverMap: Map<string, (payload: Buffer, printer: PrinterConfigInfo) => Promise<boolean>> = new Map();

  public registerDriver(
    connectionType: 'USB' | 'LAN' | 'BLUETOOTH',
    handler: (payload: Buffer, printer: PrinterConfigInfo) => Promise<boolean>
  ): void {
    this.driverMap.set(connectionType, handler);
  }

  public enqueue(
    printer: PrinterConfigInfo,
    payload: Buffer,
    priority = 5,
    maxRetries = 3
  ): PrintJob {
    const job: PrintJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      printer,
      payload,
      priority,
      status: 'PENDING',
      retryCount: 0,
      maxRetries,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(job);
    this.processQueue();
    return job;
  }

  public getJobs(): PrintJob[] {
    return this.queue;
  }

  public cancelJob(id: string): boolean {
    const job = this.queue.find((j) => j.id === id);
    if (job && job.status === 'PENDING') {
      this.queue = this.queue.filter((j) => j.id !== id);
      return true;
    }
    return false;
  }

  public clearQueue(): void {
    this.queue = [];
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    // Filter pending and sort by priority (descending) and timestamp (ascending)
    const pendingJobs = this.queue
      .filter((j) => j.status === 'PENDING')
      .sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });

    if (pendingJobs.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const currentJob = pendingJobs[0];
    currentJob.status = 'PRINTING';

    try {
      const handler = this.driverMap.get(currentJob.printer.connectionType);
      if (!handler) {
        throw new Error(`No print handler driver registered for connection type: ${currentJob.printer.connectionType}`);
      }

      const success = await handler(currentJob.payload, currentJob.printer);
      if (success) {
        currentJob.status = 'SUCCESS';
        // Clean success after retention
        this.queue = this.queue.filter((j) => j.id !== currentJob.id);
      } else {
        throw new Error('Printer driver returned false status check.');
      }
    } catch (err: any) {
      currentJob.retryCount++;
      currentJob.error = err.message;
      
      if (currentJob.retryCount >= currentJob.maxRetries) {
        currentJob.status = 'FAILED';
      } else {
        currentJob.status = 'PENDING'; // Re-try next round
      }
    } finally {
      this.isProcessing = false;
      // Continue processing next in queue
      setTimeout(() => this.processQueue(), 500);
    }
  }
}

export const printQueueManager = new PrintQueueManager();
export default printQueueManager;
